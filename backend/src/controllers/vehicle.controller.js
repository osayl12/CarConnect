const Vehicle = require('../models/Vehicle');
const FaultReport = require('../models/FaultReport');
const Appointment = require('../models/Appointment');

const EDITABLE_FIELDS = ['make', 'model', 'year', 'vin', 'licensePlate', 'color'];

function pickFields(source, fields) {
  const picked = {};
  for (const field of fields) {
    if (source[field] !== undefined) picked[field] = source[field];
  }
  return picked;
}

async function createVehicle(req, res, next) {
  try {
    const { make, model } = req.body;
    if (!make || !model) {
      res.status(400);
      throw new Error('Make and model are required');
    }

    const vehicle = await Vehicle.create({
      owner: req.user._id,
      ...pickFields(req.body, EDITABLE_FIELDS),
    });

    res.status(201).json({ vehicle });
  } catch (err) {
    next(err);
  }
}

// The customer's own vehicles.
async function getMyVehicles(req, res, next) {
  try {
    const vehicles = await Vehicle.find({ owner: req.user._id }).sort('-createdAt');
    res.json({ vehicles });
  } catch (err) {
    next(err);
  }
}

async function getVehicle(req, res, next) {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.user._id });
    if (!vehicle) {
      res.status(404);
      throw new Error('Vehicle not found');
    }
    res.json({ vehicle });
  } catch (err) {
    next(err);
  }
}

async function updateVehicle(req, res, next) {
  try {
    const updates = pickFields(req.body, EDITABLE_FIELDS);

    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!vehicle) {
      res.status(404);
      throw new Error('Vehicle not found');
    }
    res.json({ vehicle });
  } catch (err) {
    next(err);
  }
}

async function deleteVehicle(req, res, next) {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!vehicle) {
      res.status(404);
      throw new Error('Vehicle not found');
    }
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    next(err);
  }
}

// Section 2.10: basic repair record — current status, latest repair note,
// last appointment, and what problem was in the car. Deliberately just the
// latest fault report for this vehicle, not a full history (section 2.10:
// "not a full long-term repair history system").
async function getRepairRecord(req, res, next) {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.user._id });
    if (!vehicle) {
      res.status(404);
      throw new Error('Vehicle not found');
    }

    const latestReport = await FaultReport.findOne({ vehicle: vehicle._id }).sort('-createdAt');
    if (!latestReport) {
      return res.json({ record: null });
    }

    const lastAppointment = await Appointment.findOne({ faultReport: latestReport._id })
      .sort('-startTime')
      .select('startTime durationMinutes status');

    res.json({
      record: {
        faultReportId: latestReport._id,
        problem: latestReport.description,
        status: latestReport.status,
        latestNote: latestReport.quote?.notes || null,
        lastAppointment,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createVehicle,
  getMyVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  getRepairRecord,
};
