const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
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
  thumbnailImage: {
    type: String, 
    required: true
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }]
});

const News = mongoose.model('news', newsSchema);

module.exports = News;