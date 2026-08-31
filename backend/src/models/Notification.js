const mongoose = require('mongoose');

// Section 2.8: exactly these three, in-app only — no SMS/email/push.
const NOTIFICATION_TYPES = ['mechanic_replied', 'appointment_approved', 'status_changed'];

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    message: { type: String, required: true },
    faultReport: { type: mongoose.Schema.Types.ObjectId, ref: 'FaultReport' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.statics.TYPES = NOTIFICATION_TYPES;

module.exports = mongoose.model('Notification', notificationSchema);
