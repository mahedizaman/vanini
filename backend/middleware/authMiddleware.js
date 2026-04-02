const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    if (process.env.DEBUG_AUTH === 'true') {
      console.log(`[authMiddleware] ${req.method} ${req.originalUrl}`);
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      if (process.env.DEBUG_AUTH === 'true') {
        console.log('[authMiddleware] missing bearer token');
      }
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      if (process.env.DEBUG_AUTH === 'true') {
        console.log('[authMiddleware] user not found for token');
      }
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    req.user = user;
    return next();
  } catch (err) {
    if (process.env.DEBUG_AUTH === 'true') {
      console.log('[authMiddleware] token verification failed:', err.message);
    }
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

module.exports = authMiddleware;
