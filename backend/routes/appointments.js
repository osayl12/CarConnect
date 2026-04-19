const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect, mechanic, client } = require('../middleware/auth');

// GET /api/appointments/my-slots - Mechanic: get their slots
router.get('/my-slots', protect, mechanic, async (req, res) => {
  try {
    const appointments = await Appointment.find({ mechanicId: req.user._id })
      .populate('clientId', 'name phone vehicleModel')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

// GET /api/appointments/available - Client: get available slots
router.get('/available', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      status: 'available',
      date: { $gte: new Date() }
    })
      .populate('mechanicId', 'name garageName garageAddress')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

// GET /api/appointments/my-appointments - Client: get booked appointments
router.get('/my-appointments', protect, client, async (req, res) => {
  try {
    const appointments = await Appointment.find({ clientId: req.user._id })
      .populate('mechanicId', 'name garageName garageAddress')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

// POST /api/appointments/add-slot - Mechanic: add available slot
router.post('/add-slot', protect, mechanic, async (req, res) => {
  try {
    const { date, time, notes } = req.body;
    const appointment = await Appointment.create({
      mechanicId: req.user._id,
      date: new Date(date),
      time,
      notes,
    });
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

// PATCH /api/appointments/:id/book - Client: book a slot
router.patch('/:id/book', protect, client, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, status: 'available' },
      { clientId: req.user._id, status: 'booked' },
      { new: true }
    ).populate('mechanicId', 'name garageName');

    if (!appointment) return res.status(400).json({ message: 'תור לא זמין' });

    // Notify mechanic
    const io = req.app.get('io');
    io.to(appointment.mechanicId._id.toString()).emit('appointment-booked', {
      clientName: req.user.name,
      date: appointment.date,
      time: appointment.time,
    });

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

// PATCH /api/appointments/:id/cancel
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', clientId: null },
      { new: true }
    );
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

module.exports = router;
