const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
require('dotenv').config();
const {uploadArticle} = require('../helper/articles');
const Article = require('../models/Article');

router.post('/upload', async(req, res) => {
    uploadArticle(req, res, Article, User);
});

module.exports = router;