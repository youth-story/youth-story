const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  media: {
    type: String,
  },
  is_blocked: {
    type: Boolean,
    default: false
  }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;