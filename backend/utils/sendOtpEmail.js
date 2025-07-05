const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',  
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'SmartSync - Verify your email',
    text: `Your OTP for SmartSync is: ${otp}. It will expire in 10 minutes.`
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendOtpEmail;
