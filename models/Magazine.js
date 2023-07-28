const mongoose = require('mongoose');

const magazineSchema = new mongoose.Schema({
  image: {
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
  rating: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rating',
  }
});

const Magazine = mongoose.model('Magazine', magazineSchema);

module.exports = Magazine;
