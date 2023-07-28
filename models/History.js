const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  magazines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Magazine',
  }]
});

const History = mongoose.model('History', historySchema);

module.exports = History;