const mongoose = require('mongoose');

const followersSchema = new mongoose.Schema({
  main: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  }]
});

const Followers = mongoose.model('Followers', followersSchema);

module.exports = Followers;
