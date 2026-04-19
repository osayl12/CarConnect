const express = require('express');
const router = express.Router();
const FaultReport = require('../models/FaultReport');
const { protect, mechanic, client } = require('../middleware/auth');

// GET /api/faults/my-faults - Client: get own faults
router.get('/my-faults', protect, client, async (req, res) => {
  try {
    const faults = await FaultReport.find({ clientId: req.user._id })
      .populate('mechanicId', 'name garageName')
      .sort({ createdAt: -1 });
    res.json(faults);
  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

// GET /api/faults/mechanic-faults - Mechanic: get all faults
router.get('/mechanic-faults', protect, mechanic, async (req, res) => {
  try {
    const faults = await FaultReport.find()
      .populate('clientId', 'name phone vehicleModel vehicleVIN')
      .sort({ createdAt: -1 });
    res.json(faults);
  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

// POST /api/faults - Create fault report
router.post('/', protect, client, async (req, res) => {
  try {
    const { description, errorCode, severity, additionalNotes } = req.body;

    const fault = await FaultReport.create({
      clientId: req.user._id,
      description,
      errorCode,
      severity,
      additionalNotes,
      source: 'manual',
    });

    // Notify all mechanics via Socket.io
    const io = req.app.get('io');
    io.emit('new-fault', {
      faultId: fault._id,
      clientName: req.user.name,
      description: fault.description,
      severity: fault.severity,
    });

    res.status(201).json(fault);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

// PATCH /api/faults/:id/status - Update fault status
router.patch('/:id/status', protect, mechanic, async (req, res) => {
  try {
    const fault = await FaultReport.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        mechanicId: req.user._id,
        ...(req.body.mechanicResponse && { mechanicResponse: req.body.mechanicResponse }),
        ...(req.body.estimatedCost && { estimatedCost: req.body.estimatedCost }),
      },
      { new: true }
    ).populate('clientId', 'name');

    if (!fault) return res.status(404).json({ message: 'דיווח לא נמצא' });

    // Notify client
    const io = req.app.get('io');
    io.to(fault.clientId._id.toString()).emit('fault-updated', {
      faultId: fault._id,
      status: fault.status,
      mechanicName: req.user.name,
    });

    res.json(fault);
  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

// PATCH /api/faults/:id/mechanic-response
router.patch('/:id/mechanic-response', protect, mechanic, async (req, res) => {
  try {
    const { mechanicResponse, estimatedCost, estimatedTime, requiredParts } = req.body;
    const fault = await FaultReport.findByIdAndUpdate(
      req.params.id,
      { mechanicResponse, estimatedCost, estimatedTime, requiredParts, status: 'in_progress' },
      { new: true }
    );
    res.json(fault);
  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

module.exports = router;
