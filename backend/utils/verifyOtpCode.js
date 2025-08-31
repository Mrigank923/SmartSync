// utils/verifyOtpCode.js
/**
 * Confirms OTP matches and has not expired.
 * Returns true / false.
 */
const User = require('../models/User');

module.exports = async function verifyOtpCode(email, code) {
  const user = await User.findOne({ email });
  if (!user) return false;
  if (user.otpCode !== code) return false;
  if (user.otpExpires < Date.now()) return false;
  return true;
};
