const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Partners = require('../models/Partners');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
require('dotenv').config();
const {getTeamDetails, getPartnerDetails, getTopReviews, getStats} = require('../helper/aboutInfo');
const Reviews = require('../models/Reviews');

// Get team members list
router.get('/team', async (req, res) => {
  getTeamDetails(req, res, User);
});

// Get list of sponsors
router.get('/partners', async(req, res) => {
  getPartnerDetails(req, res, Partners);
});

// Get top 5 reviews
router.get('/top-reviews', async(req, res) => {
  getTopReviews(req, res, Reviews);
});

// Get the stats of app
router.get('/stats', async(req, res) => {
  getStats(req, res, User, Partners, Reviews);
});

module.exports = router;