const mongoose = require('mongoose');

const conversationParticipantSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastSeenMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
});

const ConversationParticipant = mongoose.model('ConversationParticipant', conversationParticipantSchema);

module.exports = ConversationParticipant;