const express = require('express');
const {
  createFaultReport,
  getMyFaultReports,
  getFaultReport,
} = require('../controllers/fault.controller');
const { protect, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.post('/', requireRole('customer'), upload.single('image'), createFaultReport);
router.get('/mine', requireRole('customer'), getMyFaultReports);
// Ownership/role check (owner or any mechanic) happens inside the controller.
router.get('/:id', getFaultReport);

module.exports = router;
