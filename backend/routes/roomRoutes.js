// routes/roomRoutes.js
const express     = require('express');
const router      = express.Router();
const auth        = require('../middleware/auth');
const roomMember  = require('../middleware/roomMember');
const roomCtrl    = require('../controllers/roomController');

// ---------- create & list ----------
router.post('/', auth, roomCtrl.createRoom);
router.get('/my', auth, roomCtrl.listMyRooms);

// ---------- join ----------
router.post('/join', auth, roomCtrl.requestJoin);

// ---------- approve / reject (owner only) ----------
router.patch('/:id/approve', auth, roomCtrl.approveMember);

// ---------- room details ----------
router.get('/:id', auth, roomMember, roomCtrl.getRoomDetails);

module.exports = router;
