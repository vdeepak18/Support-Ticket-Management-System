const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Authentication required' });
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await User.findPublicById(payload.userId);
    if (!user) return res.status(401).json({ success: false, message: 'Account no longer exists' });
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    next(error);
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Administrator access required' });
  next();
}

module.exports = { authenticate, adminOnly };
