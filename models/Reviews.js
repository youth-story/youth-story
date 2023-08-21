const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    commentType: {
        type: String,
        enum: ['Article', 'Interviews', 'Post', 'News', 'Events', 'Magazine', 'Contests'],
        required: true
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