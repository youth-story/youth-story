const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
    job_title: {
        type: String,
        required: true,
    },
    job_description: {
        type: String,
        required: true,
    },
    listed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['Full Time', 'Part Time'],
    },
    pay: {
        type: Number,
        required: true,
    },
    status: {
        type: Number,
        default: 1,
    },
    views: {
        type: Number,
        default: 300,
    },
    createdAt: { 
        type: Date,
        default: Date.now
    },  
});

module.exports = mongoose.model('Careers', careerSchema);