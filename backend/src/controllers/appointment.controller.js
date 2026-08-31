const Appointment = require('../models/Appointment');
const FaultReport = require('../models/FaultReport');

// Section 2.6: mechanic defines available appointment slots.
async function createSlot(req, res, next) {
  try {
    const { startTime, durationMinutes } = req.body;
    if (!startTime) {
      res.status(400);
      throw new Error('Start time is required');
    }
    const parsed = new Date(startTime);
    if (Number.isNaN(parsed.getTime())) {
      res.status(400);
      throw new Error('Start time is invalid');
    }
    if (parsed < new Date()) {
      res.status(400);
      throw new Error('Start time must be in the future');
    }

    const appointment = await Appointment.create({
      mechanic: req.user._id,
      startTime: parsed,
      durationMinutes: durationMinutes || undefined,
    });

    res.status(201).json({ appointment });
  } catch (err) {
    next(err);
  }
}

// All of this mechanic's slots, any status — their calendar.
async function getMySlots(req, res, next) {
  try {
    const appointments = await Appointment.find({ mechanic: req.user._id })
      .populate('customer', 'name email phone')
      .populate('faultReport', 'description status')
      .sort('startTime');
    res.json({ appointments });
  } catch (err) {
    next(err);
  }
}

// Open slots any customer can browse, across all mechanics.
async function getAvailableSlots(req, res, next) {
  try {
    const appointments = await Appointment.find({
      status: 'available',
      startTime: { $gte: new Date() },
    })
      .populate('mechanic', 'name')
      .sort('startTime');
    res.json({ appointments });
  } catch (err) {
    next(err);
  }
}

// The customer's own requested/confirmed/cancelled appointments.
async function getMyBookings(req, res, next) {
  try {
    const appointments = await Appointment.find({ customer: req.user._id })
      .populate('mechanic', 'name')
      .populate('faultReport', 'description status')
      .sort('-startTime');
    res.json({ appointments });
  } catch (err) {
    next(err);
  }
}

// Section 2.6: customer chooses an available time, for a specific report.
async function requestSlot(req, res, next) {
  try {
    const { faultReportId } = req.body;
    if (!faultReportId) {
      res.status(400);
      throw new Error('faultReportId is required');
    }

    const report = await FaultReport.findOne({ _id: faultReportId, customer: req.user._id });
    if (!report) {
      res.status(404);
      throw new Error('Fault report not found');
    }

    const existingActive = await Appointment.findOne({
      faultReport: report._id,
      status: { $in: ['requested', 'confirmed'] },
    });
    if (existingActive) {
      res.status(409);
      throw new Error('This report already has an active appointment — cancel it before booking another.');
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, status: 'available' },
      { status: 'requested', customer: req.user._id, faultReport: report._id },
      { new: true }
    )
      .populate('mechanic', 'name')
      .populate('faultReport', 'description status');

    if (!appointment) {
      res.status(409);
      throw new Error('This slot is no longer available');
    }

    res.json({ appointment });
  } catch (err) {
    next(err);
  }
}

// Mechanic approves a requested appointment (section 5: "Approve ... appointments").
async function confirmSlot(req, res, next) {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, mechanic: req.user._id, status: 'requested' },
      { status: 'confirmed' },
      { new: true }
    )
      .populate('customer', 'name email phone')
      .populate('faultReport', 'description status');

    if (!appointment) {
      res.status(404);
      throw new Error('Requested appointment not found');
    }

    if (appointment.faultReport) {
      await FaultReport.findByIdAndUpdate(appointment.faultReport._id, {
        status: 'appointment_scheduled',
      });
    }

    res.json({ appointment });
  } catch (err) {
    next(err);
  }
}

// Either the mechanic who owns the slot, or the customer who booked it.
async function cancelSlot(req, res, next) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }

    const isMechanic =
      req.user.role === 'mechanic' && appointment.mechanic.toString() === req.user._id.toString();
    const isBookingCustomer =
      req.user.role === 'customer' && appointment.customer?.toString() === req.user._id.toString();
    if (!isMechanic && !isBookingCustomer) {
      res.status(403);
      throw new Error('Not authorized to cancel this appointment');
    }

    const wasScheduled = appointment.status === 'confirmed' || appointment.status === 'requested';
    appointment.status = 'cancelled';
    await appointment.save();

    // Undo the report's "scheduled" status if this cancellation is what caused it.
    if (wasScheduled && appointment.faultReport) {
      const report = await FaultReport.findById(appointment.faultReport);
      if (report && report.status === 'appointment_scheduled') {
        report.status = 'under_review';
        await report.save();
      }
    }

    res.json({ appointment });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createSlot,
  getMySlots,
  getAvailableSlots,
  getMyBookings,
  requestSlot,
  confirmSlot,
  cancelSlot,
};
