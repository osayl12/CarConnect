const Vehicle = require('../models/Vehicle');

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

module.exports = { createVehicle, getMyVehicles, getVehicle, updateVehicle, deleteVehicle };
