const mongoose = require('mongoose');

const interviewsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  video: {
    type: String,
    required: true,
  },
  thumbnailImage: {
    type: String, 
    required: true
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }]
});

const Interviews = mongoose.model('Interviews', interviewsSchema);

module.exports = Interviews;