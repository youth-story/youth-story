const mongoose = require('mongoose');

const interviewsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  content: {
    type: String,
    required: true,
    maxlength: 1500,
  },
  video: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String, 
    required: true
  },
  category: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false,
        default: null,
  }],
  views: {
    type: Number,
    default: 300,
  },
  created_at: {
    type: Date,
    default: Date.now,
  }
});

const Interviews = mongoose.model('Interviews', interviewsSchema);

module.exports = Interviews;