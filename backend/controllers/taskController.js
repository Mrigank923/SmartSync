// controllers/taskController.js
const Task       = require('../models/Task');
const Room       = require('../models/Room');
const User       = require('../models/User');
const ActionLog  = require('../models/ActionLog');
const { getIO }  = require('../config/socket');

const forbiddenTitles = ['Todo', 'In Progress', 'Done'];

/** GET tasks (personal or room) */
exports.getTasks = async (req, res, next) => {
  try {
    const room = req.params.roomId || null;
    const filter = room
      ? { room }
      : { room: null, createdBy: req.user.id };

    const tasks = await Task.find(filter)
      .populate('assignedUser', 'username');
    res.json(tasks);
  } catch (err) { next(err); }
};

/** POST create task */
exports.createTask = async (req, res, next) => {
  try {
    const room = req.params.roomId || null;
    const { title, description, priority, status, assignedUser } = req.body;

    if (forbiddenTitles.includes(title.trim()))
      return res.status(400).json({ message: 'Task title cannot match column name' });

    const exists = await Task.findOne({ title: title.trim(), status, room });
    if (exists) return res.status(400).json({ message: 'Task title must be unique' });

    const task = await Task.create({
      title: title.trim(),
      description,
      priority,
      status,
      assignedUser: assignedUser || null,
      room,
      createdBy: req.user.id
    });

    await ActionLog.create({ actionType: 'create', task: task._id, user: req.user.id, room });
    if (task.room) {
    getIO().to(task.room.toString()).emit('task:created', task);
    }

    res.status(201).json(task);
  } catch (err) { next(err); }
};

/** PUT update task with conflict handling */
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found' });

    // ── conflict check
    if (new Date(req.body.updatedAt).getTime() !== task.updatedAt.getTime()) {
      return res.status(409).json({
        message: 'Conflict detected',
        serverVersion: task,
        clientVersion: req.body
      });
    }

    // ── title rules
    if (req.body.title) {
      if (forbiddenTitles.includes(req.body.title.trim()))
        return res.status(400).json({ message: 'Task title cannot match column name' });

      if (req.body.title.trim() !== task.title) {
        const dup = await Task.findOne({
          title: req.body.title.trim(),
          status: req.body.status,
          room: task.room
        });
        if (dup) return res.status(400).json({ message: 'Task title must be unique' });
      }
    }

    Object.assign(task, req.body, { updatedAt: new Date() });
    await task.save();

    await ActionLog.create({ actionType: 'update', task: task._id, user: req.user.id, room: task.room });
    if (task.room) {
    getIO().to(task.room.toString()).emit('task:updated', task);
    }

    res.json(task);
  } catch (err) { next(err); }
};

/** DELETE task */
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found' });

    await ActionLog.create({ actionType: 'delete', task: task._id, user: req.user.id, room: task.room });
    if (task.room) {
      getIO().to(task.room.toString()).emit('task:deleted', { id: task._id });
    }

    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

/** POST smart‑assign */
exports.smartAssign = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found' });

    // -------- collect candidates ----------
    let candidates;
    if (task.room) {
      const room = await Room.findById(task.room).select('members');
      candidates = room ? room.members : [];
    } else {
      candidates = [task.createdBy]; // personal board: only owner
    }

    // -------- count tasks per candidate ----------
    const countsAgg = await Task.aggregate([
      { $match: { room: task.room, status: { $in: ['Todo', 'In Progress'] }, assignedUser: { $in: candidates } } },
      { $group: { _id: '$assignedUser', count: { $sum: 1 } } }
    ]);
    const map = Object.fromEntries(countsAgg.map(c => [c._id.toString(), c.count]));

    let leastBusy = candidates[0];
    let minCount  = map[leastBusy.toString()] || 0;
    candidates.forEach(c => {
      const count = map[c.toString()] || 0;
      if (count < minCount) { minCount = count; leastBusy = c; }
    });

    // -------- assign ----------
    task.assignedUser = leastBusy;
    task.updatedAt    = new Date();
    await task.save();

    await ActionLog.create({ actionType: 'smart-assign', task: task._id, user: req.user.id, room: task.room });
    getIO().to(task.room || req.user.id.toString()).emit('task:updated', task);

    res.json(task);
  } catch (err) { next(err); }
};
