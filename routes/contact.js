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
const SuggestPerson = require('../models/SuggestPerson');

router.post('/toggle-newsletter', requireAuth, async(req, res) => {
    toggleNewsLetter(req, res, NewsLetter);
});

router.post('/add-review', requireAuth, async(req, res) => {
    addReview(req, res, Reviews, User, AWS);
});

router.post('/add-sponsor', async(req, res) => {
    addSponsor(req, res, Partners, User, AWS);
});

router.post('/suggest-person', async(req, res) => {
    return res.status(200).send('Works fine');
});

module.exports = router;