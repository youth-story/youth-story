const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    author: {
        type: String, 
        required: true,
    },
    content: {
        type: String, 
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    }
});

module.expors = mongoose.model('Article', articleSchema);