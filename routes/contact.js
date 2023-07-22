const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Partners = require('../models/Partners');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
require('dotenv').config();
const {toggleNewsLetter, addReview, addSponsor, applyCareers} = require('../helper/contact');
const Reviews = require('../models/Reviews');
const NewsLetter = require('../models/NewsLetter');
const AWS = require('../aws-config');
const Careers = require('../models/Careers');

router.post('/toggle-newsletter', requireAuth, async(req, res) => {
    toggleNewsLetter(req, res, NewsLetter);
});

router.post('/add-review', requireAuth, async(req, res) => {
    addReview(req, res, Reviews, User, AWS);
});

router.post('/add-sponsor', requireAuth, async(req, res) => {
    addSponsor(req, res, Partners, User, AWS);
});

router.post('/apply-careers', requireAuth, async(req, res) => {
    applyCareers(req, res, Careers, User, AWS);
});

module.exports = router;