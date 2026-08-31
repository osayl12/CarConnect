const mongoose = require('mongoose');

// Section 2.7: basic status tracking.
const STATUSES = [
  'waiting_for_mechanic',
  'under_review',
  'appointment_scheduled',
  'repaired',
  'completed',
];

// Section 2.5: mechanic's repair response/quote. Embedded rather than a
// separate collection — this is a lightweight MVP (section 2.10: "not a
// full long-term repair history system"), so only the latest quote matters,
// not a history of revisions.
const quoteSchema = new mongoose.Schema(
  {
    price: { type: Number, required: true, min: 0 },
    estimatedTime: { type: String, required: true, trim: true }, // free text, e.g. "2 days"
    parts: [{ type: String, trim: true }],
    notes: { type: String, trim: true },
    respondedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const faultReportSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    description: { type: String, required: true, trim: true },
    // Optional per section 2.3 ("if available").
    errorCode: { type: String, trim: true },
    // Filename under backend/uploads/ — see middleware/upload.js. Served at
    // /uploads/<imagePath>; the API adds the full imageUrl in responses.
    imagePath: { type: String },
    // Feeds manual mechanic prioritization/filtering (section 2.9).
    urgency: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: STATUSES, default: 'waiting_for_mechanic' },
    quote: { type: quoteSchema, default: undefined },
  },
  { timestamps: true }
);

faultReportSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('FaultReport', faultReportSchema);
