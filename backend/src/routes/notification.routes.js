const express = require('express');
const { listNotifications, markRead, markAllRead } = require('../controllers/notification.controller');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// Section 2.8: only customers receive notifications (mechanic replied,
// appointment approved, status changed — all things that happen *to* the
// customer).
router.use(protect, requireRole('customer'));

router.get('/', listNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);

module.exports = router;
