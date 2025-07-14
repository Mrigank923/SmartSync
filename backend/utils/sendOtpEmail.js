// utils/sendOtpEmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',            // or SMTP host
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Sends a 6‑digit OTP to the given email.
 * @param {string} to   – recipient email
 * @param {string} otp  – 6‑digit code
 */
module.exports = async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: `SmartSync <${process.env.EMAIL_USER}>`,
    to,
    subject: 'SmartSync – Verify your email',
    text: `Your OTP for SmartSync is: ${otp}. It will expire in 10 minutes.`
  };

  await transporter.sendMail(mailOptions);
};
