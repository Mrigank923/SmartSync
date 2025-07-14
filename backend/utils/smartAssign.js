// utils/smartAssign.js
/**
 * Given a roomId (or null for personal board), returns
 * the userId of the least‑busy member (Todo/In Progress counts).
 * Personal board → returns the ownerId (only member).
 */
const Task = require('../models/Task');
const Room = require('../models/Room');

/**
 * @param {String|null} roomId
 * @param {String}      ownerId   – task creator (for personal board)
 * @returns {String} userId
 */
module.exports = async function smartAssign(roomId, ownerId) {
  // ---- 1. Gather candidate users ----
  let candidates;
  if (roomId) {
    const room = await Room.findById(roomId).select('members');
    candidates = room ? room.members : [];
  } else {
    candidates = [ownerId]; // personal board
  }

  // ---- 2. Count active tasks per candidate ----
  const counts = await Task.aggregate([
    { $match: { room: roomId, status: { $in: ['Todo', 'In Progress'] }, assignedUser: { $in: candidates } } },
    { $group: { _id: '$assignedUser', count: { $sum: 1 } } }
  ]);

  const map = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]));

  // ---- 3. Pick the least busy ----
  let least = candidates[0];
  let min   = map[least?.toString()] || 0;
  candidates.forEach(uid => {
    const c = map[uid.toString()] || 0;
    if (c < min) { min = c; least = uid; }
  });

  return least;
};
