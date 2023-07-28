const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  ends_at: {
    type: Date,
    required: true
  },
  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Applicant',
  }],
  winners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Applicant',
  }]
});

const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;