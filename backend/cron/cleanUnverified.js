const cron = require('node-cron');
const User = require('../models/User');

function startCleanUnverifiedJob() {
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running unverified user cleanup...');
    const result = await User.deleteMany({
      emailVerified: false,
      otpExpires: { $lt: Date.now() }
    });
    console.log(`[CRON] Deleted ${result.deletedCount} unverified users.`);
  });
}

module.exports = startCleanUnverifiedJob;
