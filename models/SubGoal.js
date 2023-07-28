// models/subgoalModel.js
const mongoose = require('mongoose');

const subgoalSchema = new mongoose.Schema({
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const Subgoal = mongoose.model('Subgoal', subgoalSchema);

module.exports = Subgoal;