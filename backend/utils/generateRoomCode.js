// utils/generateRoomCode.js
/**
 * Generates a unique 6‑character alphanumeric room code.
 * Retries until uniqueness in DB.
 */
const Room = require('../models/Room');

module.exports = async function generateRoomCode() {
  let code;
  do {
    code = Math.random().toString(36).slice(-6).toUpperCase(); // e.g. "A1B2C3"
  } while (await Room.findOne({ code }));
  return code;
};
