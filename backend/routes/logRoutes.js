// routes/logRoutes.js
const express    = require('express');
const router     = express.Router();
const auth       = require('../middleware/auth');        // JWT → req.user
const roomMember = require('../middleware/roomMember');  // ensures user ∈ room
const logCtrl    = require('../controllers/logController');

// Personal logs (room = null)
router.get('/', auth, logCtrl.getLogs);

// Room‑specific logs
router.get('/rooms/:roomId', auth, roomMember, logCtrl.getLogs);

module.exports = router;
