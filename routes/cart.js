const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
require('dotenv').config();
// const {uploadArticle} = require('../helper/articles');
const Cart = require('../models/Cart');

router.post('/add-item', async(req, res) => {
    return res.status(200).send('Works fine');
});

router.delete('/remove-item', async(req, res) => {
    return res.status(200).send('Works fine');
});

router.post('/view-item', async(req, res) => {
    return res.status(200).send('Works fine');
});

module.exports = router;