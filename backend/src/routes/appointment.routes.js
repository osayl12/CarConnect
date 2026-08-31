const express = require('express');
const {
  createSlot,
  getMySlots,
  getAvailableSlots,
  getMyBookings,
  requestSlot,
  confirmSlot,
  cancelSlot,
} = require('../controllers/appointment.controller');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', requireRole('mechanic'), createSlot);
router.get('/mine', requireRole('mechanic'), getMySlots);
router.get('/available', getAvailableSlots);
router.get('/my-bookings', requireRole('customer'), getMyBookings);
router.patch('/:id/request', requireRole('customer'), requestSlot);
router.patch('/:id/confirm', requireRole('mechanic'), confirmSlot);
// Ownership check (owning mechanic or booking customer) happens inside the controller.
router.patch('/:id/cancel', cancelSlot);

module.exports = router;
