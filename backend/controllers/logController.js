// controllers/logController.js
const ActionLog = require('../models/ActionLog');

/**
 * GET /logs or /logs/rooms/:roomId
 * Returns last 20 actions sorted newest → oldest.
 */
exports.getLogs = async (req, res, next) => {
  try {
    const room = req.params.roomId || null;

    // Personal board ⇒ room=null & only the requesting user’s actions
    const filter = room
      ? { room }                                  // room logs
      : { room: null, user: req.user.id };        // personal logs

    const logs = await ActionLog.find(filter)
      .sort({ createdAt: -1 })   // or { timestamp: -1 } if your schema uses that
      .limit(20)
      .populate('task', 'title')
      .populate('user', 'username');

    res.json(logs);
  } catch (err) { next(err); }
};
