const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    review: {
        type: String,
        required: false,
    },
    ratings: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
});

module.exports = mongoose.model('Reviews', reviewSchema);