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
    const roomId = req.query.roomId || null;
    let filter = {};
    
    if (roomId) {
      filter.roomId = roomId;
    } else {
      // Personal tasks - tasks without roomId and created by current user
      filter.roomId = null;
      filter.createdBy = req.user.id;
    }

    const tasks = await Task.find(filter)
      .populate('assignedUser', 'username')
      .populate('roomId', 'name')
      .sort({ createdAt: -1 });
      
    res.json(tasks);
  } catch (err) { next(err); }
};

/** POST create task */
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, assignedUser, roomId } = req.body;

    if (forbiddenTitles.includes(title.trim()))
      return res.status(400).json({ message: 'Task title cannot match column name' });
    
    if (roomId) {
      const exists = await Task.findOne({ title: title.trim(), status, roomId });
      if (exists) return res.status(400).json({ message: 'Task title must be unique' });
      } else {
      const exists = await Task.findOne({ title: title.trim(), status, createdBy: req.user.id });
      if (exists) return res.status(400).json({ message: 'Task title must be unique' });
    }

    const task = await Task.create({
      title: title.trim(),
      description,
      priority,
      status,
      assignedUser: assignedUser || null,
      roomId: roomId || null,
      createdBy: req.user.id
    });

    await ActionLog.create({ 
      actionType: 'create', 
      task: task._id, 
      user: req.user.id, 
      room: roomId 
    });
    
     // Emit socket event based on type
     if (task.roomId) {
      // Task is linked to a room → broadcast to the room
      getIO().to(task.roomId.toString()).emit('task:created', task);
    } else {
      // Task is personal → emit only to the user’s personal channel
      getIO().to(req.user.id.toString()).emit('task:created', task);
    }

    // Populate the task before sending response
    const populatedTask = await Task.findById(task._id)
      .populate('assignedUser', 'username')
      .populate('roomId', 'name');

    res.status(201).json(populatedTask);
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
          roomId: task.roomId || null
        });
        if (dup) return res.status(400).json({ message: 'Task title must be unique' });
      }
    }

    Object.assign(task, req.body, { updatedAt: new Date() });
    await task.save();

    await ActionLog.create({ 
      actionType: 'update', 
      task: task._id, 
      user: req.user.id, 
      room: task.roomId || null 
    });
    
    if (task.roomId) {
      getIO().to(task.roomId.toString()).emit('task:updated', task);
    }
    else {
      getIO().to(req.user.id.toString()).emit('task:updated', task);
    }

    // Populate the task before sending response
    const populatedTask = await Task.findById(task._id)
      .populate('assignedUser', 'username')
      .populate('roomId', 'name');

    res.json(populatedTask);
  } catch (err) { next(err); }
};

/** DELETE task */
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await Task.findByIdAndDelete(req.params.id);
    await ActionLog.create({ 
      actionType: 'delete', 
      task: task._id, 
      user: req.user.id, 
      room: task.roomId || null 
    });

    if (task.roomId) {
      getIO().to(task.roomId.toString()).emit('task:deleted', task._id);
    }
    else {
      getIO().to(req.user.id.toString()).emit('task:deleted', task._id);
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (err) { next(err); }
};

/** POST smart assign task */
exports.smartAssign = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    // Ensure task is in a room
    if (!task.roomId) {
      return res.status(400).json({ message: 'Smart assign can only be done inside a room' });
    }

   
    // Fetch all users in that room
    const room = await Room.findById(task.roomId).populate('members');
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const users = room.members;
    if (users.length < 2) {
      return res.status(400).json({ message: 'Smart assign requires at least 2 members in the room' });
    }
    // Count tasks for each user
    const userTaskCounts = await Promise.all(
      users.map(async (user) => {
        const count = await Task.countDocuments({ assignedUser: user._id });
        return { user, count };
      })
    );

    const leastBusyUser = userTaskCounts.reduce((min, current) => 
      current.count < min.count ? current : min
    );

    task.assignedUser = leastBusyUser.user._id;
    await task.save();

    await ActionLog.create({ 
      actionType: 'smart-assign', 
      task: task._id, 
      user: req.user.id, 
      room: task.roomId 
    });

    if (task.roomId) {
      getIO().to(task.roomId.toString()).emit('task:updated', task);
    }

    res.json({ message: 'Task smart assigned', assignedTo: leastBusyUser.user.username });
  } catch (err) { next(err); }
};
