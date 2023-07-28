const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  career: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Career', 
    required: true
  },
  resume: {
    type: String,
    required: false,
  },
  message: {
    type: String,
    required: true,
  },
});

const Applicant = mongoose.model('Applicant', applicantSchema);

module.exports = Applicant;