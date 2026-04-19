const mongoose = require('mongoose');

const faultReportSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mechanicId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  description: { type: String, required: true },
  errorCode: String,  // OBD2 DTC code
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  additionalNotes: String,
  imageUrl: String,

  status: {
    type: String,
    enum: ['pending', 'in_progress', 'awaiting_appointment', 'resolved'],
    default: 'pending'
  },

  // Mechanic response
  mechanicResponse: String,
  estimatedCost: Number,
  estimatedTime: String,
  requiredParts: [String],

  // Source: manual or sensor
  source: { type: String, enum: ['manual', 'sensor', 'obd2'], default: 'manual' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

faultReportSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('FaultReport', faultReportSchema);
