const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the JWT on the request and attaches the user to req.user.
// Use on any route that requires a logged-in user.
async function protect(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401);
      return next(new Error('Not authorized, user not found'));
    }
    req.user = user;
    next();
  } catch {
    res.status(401);
    next(new Error('Not authorized, invalid or expired token'));
  }
}

// Role-based access control (section 2.1). Use after `protect`, e.g.
// router.get('/mechanic-only', protect, requireRole('mechanic'), handler).
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error('Forbidden: insufficient role'));
    }
    next();
  };
}

module.exports = { protect, requireRole };
