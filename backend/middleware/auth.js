// middleware/auth.js  (JWT protect)
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Expect:  Authorization: Bearer <token>
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
      // Log failed auth attempt
      console.warn(`Authentication attempt failed: No token provided - IP: ${req.ip}`);
      return res.status(401).json({ message: 'No token, unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };           // keep payload minimal
    next();
  } catch (err) {
    // Log failed auth attempt with invalid token
    console.warn(`Authentication attempt failed: Invalid token - IP: ${req.ip}`);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
