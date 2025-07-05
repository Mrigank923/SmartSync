const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const ActionLog = require('../models/ActionLog');

router.get('/', auth, async (req, res) => {
  const logs = await ActionLog.find()
    .sort({ timestamp: -1 })
    .limit(20)
    .populate('task', 'title')
    .populate('user', 'username');
  res.json(logs);
});

module.exports = router;
