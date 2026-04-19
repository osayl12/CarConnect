const express = require('express');
const router = express.Router();
const SensorData = require('../models/SensorData');
const FaultReport = require('../models/FaultReport');
const { protect } = require('../middleware/auth');

// POST /api/sensor-data - ESP32/Arduino sends data (no auth needed, uses vehicleVIN)
router.post('/', async (req, res) => {
  try {
    const { vehicleVIN, engineTemp, batteryVoltage, rpm, speed, fuelLevel, dtcCodes, clientId } = req.body;

    const data = await SensorData.create({
      clientId,
      vehicleVIN,
      engineTemp,
      batteryVoltage,
      rpm,
      speed,
      fuelLevel,
      dtcCodes: dtcCodes || [],
    });

    // Auto-create fault report if DTC codes found
    if (dtcCodes && dtcCodes.length > 0) {
      const existingFault = await FaultReport.findOne({
        clientId,
        errorCode: dtcCodes[0],
        status: { $in: ['pending', 'in_progress'] }
      });

      if (!existingFault) {
        const fault = await FaultReport.create({
          clientId,
          description: `תקלה אוטומטית זוהתה: קודי DTC - ${dtcCodes.join(', ')}`,
          errorCode: dtcCodes[0],
          severity: 'high',
          source: 'sensor',
        });

        // Notify mechanics
        // io.emit('new-fault', { ... }) - add if io is available
      }
    }

    // Notify client with live data
    const io = req.app.get('io');
    if (clientId) {
      io.to(clientId.toString()).emit('sensor-update', data);
    }

    res.status(201).json({ message: 'נתונים נשמרו', data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

// GET /api/sensor-data/latest - Client: get latest reading
router.get('/latest', protect, async (req, res) => {
  try {
    const data = await SensorData.findOne({ clientId: req.user._id }).sort({ timestamp: -1 });
    if (!data) return res.status(404).json({ message: 'לא נמצאו נתוני חיישנים' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

// GET /api/sensor-data/history - Client: get history
router.get('/history', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const data = await SensorData.find({ clientId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(limit);
    res.json(data.reverse()); // Return in chronological order
  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

module.exports = router;
