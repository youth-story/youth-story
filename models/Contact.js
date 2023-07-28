const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['feedback', 'sponsor', 'newsletter'],
    required: true
  }
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
