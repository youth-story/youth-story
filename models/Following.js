const mongoose = require('mongoose');

const followingSchema = new mongoose.Schema({
  current: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  }]
});

const Following = mongoose.model('Following', followingSchema);

module.exports = Following;