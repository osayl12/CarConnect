const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Basic brute-force mitigation on credential-guessing endpoints. Keyed by IP,
// which is enough for a student-project MVP without adding account lockouts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later.' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);

module.exports = router;
