const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
require('dotenv').config();
// const {uploadArticle} = require('../helper/articles');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const ConversationParticipant = require('../models/ConversationParticipant');

router.post('/dm/private/:recipientId/message', async (req, res) => {
  return res.status(200).send('Works fine');
});

router.delete('/dm/private/:conversationId/message/:messageId', async (req, res) => {
  return res.status(200).send('Works fine');
});

router.get('/dm/private/unread', async (req, res) => {
  return res.status(200).send('Works fine');
});

router.get('/user/:userId/online-status', async (req, res) => {
  return res.status(200).send('Works fine');
});

router.put('/dm/private/:conversationId/message/:messageId/mark-as-read', async (req, res) => {
  return res.status(200).send('Works fine');
});

router.post('/dm/group', async (req, res) => {
  return res.status(200).send('Works fine');
});

router.get('/dm/group', async (req, res) => {
  return res.status(200).send('Works fine');
});

router.get('/dm/group/:conversationId', async (req, res) => {
  return res.status(200).send('Works fine');
});

router.put('/dm/group/:conversationId', async (req, res) => {
  return res.status(200).send('Works fine');
});

router.delete('/dm/group/:conversationId', async (req, res) => {
  return res.status(200).send('Works fine');
});

router.post('/dm/group/:conversationId/message', async (req, res) => {
  return res.status(200).send('Works fine');
});

router.delete('/dm/group/:conversationId/message/:messageId', async (req, res) => {
  return res.status(200).send('Works fine');
});

router.get('/dm/group/:conversationId/unread', async (req, res) => {
  return res.status(200).send('Works fine');
});

router.get('/dm/group/:conversationId/members/online-status', async (req, res) => {
  return res.status(200).send('Works fine');
});

router.put('/dm/group/:conversationId/message/:messageId/mark-as-read', async (req, res) => {
  return res.status(200).send('Works fine');
});

module.exports = router;