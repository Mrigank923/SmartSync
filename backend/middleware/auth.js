// middleware/auth.js  (JWT protect)
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Expect:  Authorization: Bearer <token>
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };           // keep payload minimal
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
