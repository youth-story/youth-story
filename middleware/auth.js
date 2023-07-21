const jwt = require('jsonwebtoken');
require('dotenv').config();

const requireAuth = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Authorization required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;

    const currentTimestamp = Date.now() / 1000;
    if (decoded.exp <= currentTimestamp) {
      return res.status(401).json({ error: 'Token expired' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { requireAuth };
