const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'carconnect_secret_key', { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, ...rest } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'האימייל כבר רשום במערכת' });
    }

    const user = await User.create({ name, email, password, phone, role, ...rest });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, phone: user.phone,
        vehicleModel: user.vehicleModel, garageName: user.garageName,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'אימייל או סיסמה שגויים' });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, phone: user.phone,
        vehicleModel: user.vehicleModel, vehicleVIN: user.vehicleVIN,
        garageName: user.garageName,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת' });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;
