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
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    pay: {
        type: Number,
        required: true,
    },
    applicants: [{
        username: String,
        resume: String,
    }],
    status: {
        type: Number,
        default: 1,
    },
    createdAt: { 
        type: Date,
        default: Date.now
    },  
});

module.exports = mongoose.model('Careers', careerSchema);