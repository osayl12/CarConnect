const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const ALLOWED_ROLES = ['customer', 'mechanic'];

async function register(req, res, next) {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400);
      throw new Error('Name, email, password, and role are required');
    }
    if (!ALLOWED_ROLES.includes(role)) {
      res.status(400);
      throw new Error('Role must be either "customer" or "mechanic"');
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409);
      throw new Error('An account with this email already exists');
    }

    const user = await User.create({ name, email, password, role, phone });

    res.status(201).json({ user, token: generateToken(user._id) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }

    // password now has select: false on the schema — opt back in since
    // comparePassword needs the hash.
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    res.json({ user, token: generateToken(user._id) });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, getMe };
