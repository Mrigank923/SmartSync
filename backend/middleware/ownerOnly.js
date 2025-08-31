// middleware/ownerOnly.js
/**
 * Requires `req.room` (set by roomMember) or fetches room again.
 * Use for endpoints the owner must control (e.g. approve members).
 */
const Room = require('../models/Room');

module.exports = async (req, res, next) => {
  try {
    const room = req.room || await Room.findById(req.params.id || req.params.roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.owner.toString() !== req.user.id)
      return res.status(403).json({ message: 'Only room owner can perform this action' });

    next();
  } catch (err) { next(err); }
};
