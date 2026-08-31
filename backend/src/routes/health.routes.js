const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// Simple liveness/readiness check used by the frontend landing page
// and useful for deployment health checks on Oracle Cloud later.
router.get('/', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    db: dbStates[mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
