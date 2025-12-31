const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  application_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Index لتحسين أداء جلب الرسائل حسب الـ application
messageSchema.index({ application_id: 1 });

module.exports = mongoose.model('Message', messageSchema);
