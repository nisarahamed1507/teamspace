const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  channel: {
    type: String,
    default: 'general'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
