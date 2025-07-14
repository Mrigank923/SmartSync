// controllers/authController.js
const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const User         = require('../models/User');
const sendOtpEmail = require('../utils/sendOtpEmail');

/**
 * POST /api/auth/register
 * Body: { username, email, password }
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 1.  Check duplicate
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already in use. If not verified try again after an hour' });

    // 2.  Hash pwd + generate OTP
    const passwordHash = await bcrypt.hash(password, 10);
    const otpCode      = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires   = Date.now() + 10 * 60 * 1000; // 10 min

    // 3.  Create user
    await User.create({ username, email, passwordHash, otpCode, otpExpires });

    // 4.  Send OTP
    await sendOtpEmail(email, otpCode);

    res.json({ message: 'Registered. Please verify your email using the OTP sent.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/verify-otp
 * Body: { email, otp }
 */
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user)           return res.status(400).json({ message: 'User not found' });
    if (user.emailVerified)
      return res.json({ message: 'Email already verified' });

    // mismatch / expired
    if (user.otpCode !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });
    if (user.otpExpires < Date.now())
      return res.status(400).json({ message: 'OTP expired. Register again after some time.' });

    // success
    user.emailVerified = true;
    user.otpCode = user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    // optional: require email verification
    // if (!user.emailVerified) return res.status(403).json({ message: 'Verify email first' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    next(err);
  }
};
