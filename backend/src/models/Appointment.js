const mongoose = require('mongoose');

// available -> mechanic-defined open slot, nobody attached yet
// requested -> a customer picked it for one of their fault reports, awaiting the mechanic
// confirmed -> mechanic approved it (section 5: "Approve or reschedule appointments")
// cancelled -> either side backed out; the mechanic can open a new slot instead of
//              a dedicated "reschedule" flow, which keeps this MVP-sized (section 2.6)
const APPOINTMENT_STATUSES = ['available', 'requested', 'confirmed', 'cancelled'];

const appointmentSchema = new mongoose.Schema(
  {
    mechanic: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startTime: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60, min: 15 },
    status: { type: String, enum: APPOINTMENT_STATUSES, default: 'available' },
    // Set once a customer requests this slot for a specific reported problem.
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    faultReport: { type: mongoose.Schema.Types.ObjectId, ref: 'FaultReport' },
  },
  { timestamps: true }
);

appointmentSchema.statics.STATUSES = APPOINTMENT_STATUSES;

module.exports = mongoose.model('Appointment', appointmentSchema);
