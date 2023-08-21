const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contests', 
    required: true
  },
  file: {
    type: String,
    required: false,
  },
  message: {
    type: String,
    required: true,
  },
});

const Participant = mongoose.model('Applicant', applicantSchema);

module.exports = Participant;