const mongoose = require('mongoose');

const AdminLog = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdminLog', AdminLog);
