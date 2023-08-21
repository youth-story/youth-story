const mongoose = require('mongoose');
require('dotenv').config();

const articleSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
    },
    title: {
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
    score: {
        type: Number,
        default: 0,
    },
    created_at: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Article', articleSchema);