// routes/taskRoutes.js
const express      = require('express');
const router       = express.Router();
const auth         = require('../middleware/auth');        // JWT → req.user
const roomMember   = require('../middleware/roomMember');  // ensures user ∈ room.members
const taskCtrl     = require('../controllers/taskController');

// ---------- Personal board (room = null) ----------
router
  .route('/')
  .get(auth, taskCtrl.getTasks)         // list personal
  .post(auth, taskCtrl.createTask);     // create personal

// ---------- Room board ----------
router
  .route('/rooms/:roomId')
  .get(auth, roomMember, taskCtrl.getTasks)      // list tasks in room
  .post(auth, roomMember, taskCtrl.createTask);  // create task in room

// ---------- Single‑task operations (roomId derived inside ctrl) ----------
router.put('/:id',          auth, taskCtrl.updateTask);
router.delete('/:id',       auth, taskCtrl.deleteTask);
router.post('/:id/smart-assign', auth, taskCtrl.smartAssign);

module.exports = router;
