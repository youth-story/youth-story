const mongoose = require('mongoose');

const suggestPersonSchema = new mongoose.Schema({
  suggester: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  suggestions: [{
    suggested: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    social: {
      type: String,
      required: true,
    },
  }],
});

module.exports = mongoose.model('SuggestPerson', suggestPersonSchema);
