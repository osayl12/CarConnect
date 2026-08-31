const FaultReport = require('../models/FaultReport');
const Vehicle = require('../models/Vehicle');
const notify = require('../utils/notify');

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

const URGENCY_RANK = { high: 3, medium: 2, low: 1 };

// Section 2.4: mechanic can view all incoming reports. Section 2.9: manual
// filtering/sorting — the mechanic decides priority, the system just helps
// them see it (status/urgency filters, sort by newest/oldest/urgency).
async function getAllFaultReports(req, res, next) {
  try {
    const { status, urgency, sort } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;

    let query = FaultReport.find(filter)
      .populate('vehicle', 'make model year')
      .populate('customer', 'name email phone');

    query = query.sort(sort === 'oldest' ? 'createdAt' : '-createdAt');

    let reports = await query;

    if (sort === 'urgency') {
      reports = [...reports].sort(
        (a, b) => (URGENCY_RANK[b.urgency] || 0) - (URGENCY_RANK[a.urgency] || 0)
      );
    }

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

// Section 2.5: mechanic sends a repair response (price, time, parts, notes).
async function respondWithQuote(req, res, next) {
  try {
    const { price, estimatedTime, parts, notes } = req.body;

    if (price === undefined || price === null || price === '') {
      res.status(400);
      throw new Error('Estimated price is required');
    }
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      res.status(400);
      throw new Error('Estimated price must be a positive number');
    }
    if (!estimatedTime) {
      res.status(400);
      throw new Error('Estimated repair time is required');
    }

    const report = await FaultReport.findById(req.params.id);
    if (!report) {
      res.status(404);
      throw new Error('Fault report not found');
    }

    report.quote = {
      price: numericPrice,
      estimatedTime,
      parts: Array.isArray(parts) ? parts.filter(Boolean) : parts ? [parts] : [],
      notes: notes || '',
      respondedAt: new Date(),
    };
    // A quote is the mechanic's first substantive response — move the
    // report out of "waiting" but don't regress a report that's already
    // further along (e.g. an appointment already scheduled).
    if (report.status === 'waiting_for_mechanic') {
      report.status = 'under_review';
    }

    await report.save();
    // report.customer is still the raw ObjectId here (populate happens next).
    await notify(report.customer, 'mechanic_replied', report._id);

    await report.populate('vehicle', 'make model year vin licensePlate color');
    await report.populate('customer', 'name email phone');

    res.json({ report: presentReport(report) });
  } catch (err) {
    next(err);
  }
}

// Section 2.7: "Mechanic can update the status." A manual override for cases
// the automatic transitions (quote -> under_review, appointment confirm/cancel)
// don't cover — e.g. marking a job repaired or completed.
async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!status || !FaultReport.STATUSES.includes(status)) {
      res.status(400);
      throw new Error(`Status must be one of: ${FaultReport.STATUSES.join(', ')}`);
    }

    const report = await FaultReport.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('vehicle', 'make model year vin licensePlate color')
      .populate('customer', 'name email phone');

    if (!report) {
      res.status(404);
      throw new Error('Fault report not found');
    }

    await notify(report.customer._id, 'status_changed', report._id);

    res.json({ report: presentReport(report) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createFaultReport,
  getMyFaultReports,
  getAllFaultReports,
  getFaultReport,
  respondWithQuote,
  updateStatus,
};
