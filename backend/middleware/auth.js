const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'אין הרשאה - נא להתחבר' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'carconnect_secret_key');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'משתמש לא נמצא' });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'טוקן לא תקין' });
  }
};

const mechanic = (req, res, next) => {
  if (req.user?.role !== 'mechanic') {
    return res.status(403).json({ message: 'גישה לא מורשית - מוסכניקים בלבד' });
  }
  next();
};

const client = (req, res, next) => {
  if (req.user?.role !== 'client') {
    return res.status(403).json({ message: 'גישה לא מורשית - לקוחות בלבד' });
  }
  next();
};

module.exports = { protect, mechanic, client };
