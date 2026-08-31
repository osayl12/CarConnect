const express = require('express');
const {
  createVehicle,
  getMyVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  getRepairRecord,
} = require('../controllers/vehicle.controller');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// Vehicles belong to customers only (section 2.2).
router.use(protect, requireRole('customer'));

router.route('/').post(createVehicle).get(getMyVehicles);
router.route('/:id').get(getVehicle).put(updateVehicle).delete(deleteVehicle);
router.get('/:id/repair-record', getRepairRecord);

module.exports = router;
