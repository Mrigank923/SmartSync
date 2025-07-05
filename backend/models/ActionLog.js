const mongoose = require('mongoose');

const ActionLogSchema = new mongoose.Schema({
  actionType: String,
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  details: Object
});

module.exports = mongoose.model('ActionLog', ActionLogSchema);
