// routes/authRoutes.js
const express = require('express');
const router  = express.Router();
const authCtrl = require('../controllers/authController');

// POST /api/auth/register
router.post('/register',   authCtrl.register);

// POST /api/auth/verify-otp
router.post('/verify-otp', authCtrl.verifyOtp);

// POST /api/auth/login
router.post('/login',      authCtrl.login);

module.exports = router;
