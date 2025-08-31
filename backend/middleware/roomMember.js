// middleware/roomMember.js
const Room = require('../models/Room');

/**
 * Guards routes of the form:
 *   /rooms/:roomId  OR  /tasks/rooms/:roomId
 * Expects param name "roomId" or "id" (for /rooms/:id).
 */
module.exports = async (req, res, next) => {
  try {
    const roomId = req.params.roomId || req.params.id;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const uid = req.user.id;
    const isMember = room.members.some(m => m.toString() === uid);
    const isOwner  = room.owner.toString() === uid;

    if (!isMember && !isOwner)
      return res.status(403).json({ message: 'Not a room member' });

    // attach room for downstream handlers if needed
    req.room = room;
    next();
  } catch (err) { next(err); }
};
