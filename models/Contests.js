const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  ends_at: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  prizes: {
    type: String,
    required: true,
  }
});

const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;