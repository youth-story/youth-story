const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
require('dotenv').config();
// const {uploadArticle} = require('../helper/articles');
const Category = require('../models/Category');

router.post('/upload', async(req, res) => {
    return res.status(200).send('Works fine');
});

router.get('/view/:id', async(req, res) => {
    return res.status(200).send('Works fine');
});

router.put('/update/:id', async(req, res) => {
    return res.status(200).send('Works fine');
});

router.delete('/delete/:id', async(req, res) => {
    return res.status(200).send('Works fine');
});

router.get('/view-all', async(req, res) => {
    return res.status(200).send('Works fine');
});

module.exports = router;