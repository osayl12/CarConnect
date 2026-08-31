const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    // Section 2.2: link vehicles to customers.
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, min: 1900, max: new Date().getFullYear() + 1 },
    // Registration/VIN details kept optional — not every customer will have
    // them on hand when adding a vehicle (per project scope section 2.2).
    vin: { type: String, trim: true, uppercase: true },
    licensePlate: { type: String, trim: true, uppercase: true },
    color: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
