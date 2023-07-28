const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
require('dotenv').config();
// const {uploadArticle} = require('../helper/articles');
const History = require('../models/History');

router.post('/view-item', async(req, res) => {
    return res.status(200).send('Works fine');
});

module.exports = router;