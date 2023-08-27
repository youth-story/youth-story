const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Partners = require('../models/Partners');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
require('dotenv').config();
const {getUserCount} = require('../helper/aboutInfo');

// Get the stats of app
router.get('/stats', async(req, res) => {
  getUserCount(req, res, User);
});

module.exports = router;