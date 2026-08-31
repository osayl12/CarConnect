const FaultReport = require('../models/FaultReport');
const Vehicle = require('../models/Vehicle');

// Adds the publicly servable image URL and strips the on-disk filename.
function presentReport(report) {
  const obj = report.toObject ? report.toObject() : report;
  const { imagePath, ...rest } = obj;
  return { ...rest, imageUrl: imagePath ? `/uploads/${imagePath}` : null };
}

async function createFaultReport(req, res, next) {
  try {
    const { vehicle: vehicleId, description, errorCode, urgency } = req.body;

    if (!vehicleId || !description) {
      res.status(400);
      throw new Error('Vehicle and description are required');
    }

    // A customer can only report faults on their own vehicle.
    const vehicle = await Vehicle.findOne({ _id: vehicleId, owner: req.user._id });
    if (!vehicle) {
      res.status(404);
      throw new Error('Vehicle not found');
    }

    const report = await FaultReport.create({
      customer: req.user._id,
      vehicle: vehicle._id,
      description,
      errorCode,
      urgency,
      imagePath: req.file ? req.file.filename : undefined,
    });

    res.status(201).json({ report: presentReport(report) });
  } catch (err) {
    next(err);
  }
}

// The customer's own fault reports (section 2.7: "Customer can view current
// status of the request").
async function getMyFaultReports(req, res, next) {
  try {
    const reports = await FaultReport.find({ customer: req.user._id })
      .populate('vehicle', 'make model year')
      .sort('-createdAt');
    res.json({ reports: reports.map(presentReport) });
  } catch (err) {
    next(err);
  }
}

// Section 2.4: any mechanic can open any report. A customer can only open
// their own.
async function getFaultReport(req, res, next) {
  try {
    const report = await FaultReport.findById(req.params.id)
      .populate('vehicle', 'make model year vin licensePlate color')
      .populate('customer', 'name email phone');

    if (!report) {
      res.status(404);
      throw new Error('Fault report not found');
    }

    const isOwner = report.customer._id.toString() === req.user._id.toString();
    const isMechanic = req.user.role === 'mechanic';
    if (!isOwner && !isMechanic) {
      res.status(403);
      throw new Error('Not authorized to view this report');
    }

    res.json({ report: presentReport(report) });
  } catch (err) {
    next(err);
  }
}

module.exports = { createFaultReport, getMyFaultReports, getFaultReport };
