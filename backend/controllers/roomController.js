// controllers/roomController.js
const Room       = require('../models/Room');
const { getIO }  = require('../config/socket');
const genCode    = require('../utils/generateRoomCode');

/** POST /api/rooms  – create room */
exports.createRoom = async (req, res, next) => {
  try {
    const code = await genCode();
    const room = await Room.create({
      name:   req.body.name,
      code,
      owner:  req.user.id,
      members:[req.user.id],
    });
    res.status(201).json(room);
  } catch (err) { next(err); }
};

/** GET /api/rooms/my  – rooms I own or joined */
exports.listMyRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }]
    }).select('name code owner members description'); // Add members and description
    res.json(rooms);
  } catch (err) { next(err); }
};

/** POST /api/rooms/join  – request join via code */
exports.requestJoin = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Room code is required' });
    }

    const room = await Room.findOne({ code: code.toUpperCase() });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.members.includes(req.user.id))
      return res.status(400).json({ message: 'Already a member' });

    if (room.pending.includes(req.user.id))
      return res.status(400).json({ message: 'Join request already sent' });

    room.pending.push(req.user.id);
    await room.save();
    res.json({ message: 'Request sent. Await owner approval.' });
  } catch (err) { next(err); }
};

/** PATCH /api/rooms/:id/approve  – owner approves or rejects */
exports.approveMember = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.owner.toString() !== req.user.id)
      return res.status(403).json({ message: 'Only owner can approve' });

    const { userId, approve } = req.body;
    room.pending = room.pending.filter(id => id.toString() !== userId);

    if (approve) room.members.push(userId);
    await room.save();

    getIO().to(room._id.toString()).emit('room:memberUpdate', { userId, approve });
    res.json({ message: approve ? 'User added' : 'Request rejected' });
  } catch (err) { next(err); }
};

/** GET /api/rooms/:id  – details */
exports.getRoomDetails = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('members', 'username email')
      .populate('pending', 'username email')  // Make sure this is working
      .populate('owner', 'username email');
    
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    console.log('Room details with pending:', {
      id: room._id,
      name: room.name,
      pendingCount: room.pending.length,
      pending: room.pending
    });
    
    res.json(room);
  } catch (err) { next(err); }
};

/** GET /api/rooms/members  – get all users (for task assignment) */
exports.getMembers = async (req, res, next) => {
  try {
    // For now, return all users. In a real app, you might want to filter by room members
    const User = require('../models/User');
    const users = await User.find().select('username email');
    res.json(users);
  } catch (err) { next(err); }
};

/** DELETE /api/rooms/:id  – delete room (owner only) */
exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.owner.toString() !== req.user.id)
      return res.status(403).json({ message: 'Only owner can delete the room' });

    await room.remove();
    getIO().to(room._id.toString()).emit('room:deleted', { roomId: room._id });
    res.json({ message: 'Room deleted' });
  } catch (err) { next(err); }
};

