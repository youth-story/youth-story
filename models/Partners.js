const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
  },
  reachedBy: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    requierd: true,
  },
  message: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model('Partner', partnerSchema);