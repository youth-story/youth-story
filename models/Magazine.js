const mongoose = require('mongoose');

const magazineSchema = new mongoose.Schema({
  cover: {
    type: String,
    required: true
  },
  file: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  downloads: {
    type: Number,
    default: 300,
  },
  created_at: {
    type: Date,
    default: Date.now,
  }
});

const Magazine = mongoose.model('Magazine', magazineSchema);

module.exports = Magazine;
