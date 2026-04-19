const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  mechanicId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  faultId: { type: mongoose.Schema.Types.ObjectId, ref: 'FaultReport' },

  date: { type: Date, required: true },
  time: { type: String, required: true },
  notes: String,

  status: {
    type: String,
    enum: ['available', 'booked', 'cancelled', 'completed'],
    default: 'available'
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Appointment', appointmentSchema);
