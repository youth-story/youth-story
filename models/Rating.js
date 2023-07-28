const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  Magazine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Magazine',
    required: true,
  }
});

const Rating = mongoose.model('rating', ratingSchema);

module.exports = Rating;