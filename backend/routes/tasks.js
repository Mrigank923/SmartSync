const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const Task = require('../models/Task');
const User = require('../models/User');
const ActionLog = require('../models/ActionLog');

module.exports = (io) => {
  // Get all tasks
  router.get('/', auth, async (req, res) => {
    const tasks = await Task.find().populate('assignedUser', 'username');
    res.json(tasks);
  });

  // Create task
 router.post('/', auth, async (req, res) => {
  const { title, description, priority, status, assignedUser } = req.body;

  try {
    //  title must not match column names
    const forbiddenTitles = ['Todo', 'In Progress', 'Done'];
    if (forbiddenTitles.includes(title.trim())) {
      return res.status(400).json({ message: 'Task title cannot match column name' });
    }

    // Check uniqueness of each title
    const existing = await Task.findOne({ title: title.trim() });
    if (existing) {
      return res.status(400).json({ message: 'Task title must be unique' });
    }

    const task = await Task.create({
      title: title.trim(),
      description,
      priority,
      status,
      assignedUser: assignedUser || null
    });

    io.emit('task:created', task);
    await ActionLog.create({ actionType: 'create', task: task._id, user: req.user.id });
    io.emit('log:update', { actionType: 'create', taskId: task._id , userId: req.user.id });

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

  // Update task
  router.put('/:id', auth, async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Not found' });

      if (new Date(req.body.updatedAt).getTime() !== task.updatedAt.getTime()) {
        return res.status(409).json({
          message: 'Conflict detected',
          serverVersion: task,
          clientVersion: req.body
        });
      }

      //title must not match column names
      if (req.body.title) {
        const forbiddenTitles = ['Todo', 'In Progress', 'Done'];
        if (forbiddenTitles.includes(req.body.title.trim())) {
          return res.status(400).json({ message: 'Task title cannot match column name' });
        }

      // Check uniqueness if title changed
      if (req.body.title.trim() !== task.title) {
        const existing = await Task.findOne({ title: req.body.title.trim() });
        if (existing) {
          return res.status(400).json({ message: 'Task title must be unique' });
        }
      }
    }

      Object.assign(task, req.body, { updatedAt: new Date() });
      await task.save();
      io.emit('task:updated', task);
      await ActionLog.create({ actionType: 'update', task: task._id, user: req.user.id });
      io.emit('log:update', { actionType: 'update', taskId: task._id, userId: req.user.id });

      res.json(task);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Delete task
  router.delete('/:id', auth, async (req, res) => {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found' });
    io.emit('task:deleted', { id: req.params.id });
    await ActionLog.create({ actionType: 'delete', task: task._id, user: req.user.id });
    io.emit('log:update', { actionType: 'delete', taskId: task._id, userId: req.user.id });

    res.json({ message: 'Deleted' });
  });



  // Smart assign
  router.post('/:id/smart-assign', auth, async (req, res) => {
    try {
  // Validate task exists
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found' });

// get tasks per user from task table
    const taskCounts = await Task.aggregate([
      { $match: { status: { $in: ['Todo', 'In Progress'] }, assignedUser: { $ne: null } } },
      { $group: { _id: '$assignedUser', count: { $sum: 1 } } }
    ]);

// Build a map of userId -> count
    const taskCountMap = new Map(taskCounts.map(u => [u._id.toString(), u.count]));

    // get all users from user table
    const allUsers = await User.find({}, '_id'); 
    // console.log("All users found:", allUsers);

    // Combine taskcounts + fill missing with 0

    //this helps us in insuring that if initially no tasks are assigned to a user,
    // means everyone have 0 tasks and taskcounts will return empty ,
    // all users will still be considered in the smart assign logic .
    const userWithCounts = allUsers.map(u => ({
      _id: u._id,
      count: taskCountMap.get(u._id.toString()) || 0
    }));

     // Sort by count
    userWithCounts.sort((a, b) => a.count - b.count);

    // Assign the least busy user
    const userId = userWithCounts.length ? userWithCounts[0]._id : null;
    task.assignedUser = userId;
    task.updatedAt = new Date();
    await task.save();

    io.emit('task:updated', task);
    await ActionLog.create({ actionType: 'smart-assign', task: task._id, user: req.user.id });
    io.emit('log:update', { actionType: 'smart-assign', taskId: task._id, userId: req.user.id });
    res.json(task);
} catch (err) {
    console.error('Error in smart assign:', err);
}
  });

  return router;
};

