const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Partners = require('../models/Partners');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
require('dotenv').config();
const {getTeamDetails, getStats} = require('../helper/aboutInfo');
const Reviews = require('../models/Reviews');
const NewsLetter = require('../models/NewsLetter');

// Get team members list
router.get('/team', async (req, res) => {
  getTeamDetails(req, res, User);
});

// Get the stats of app
router.get('/stats', async(req, res) => {
  getStats(req, res, User);
});

module.exports = router;