const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
require('dotenv').config();
const {uploadMagazine, readMagazine, updateMagazine, deleteMagazine, toggleLikeMagazine, shareMagazine, commentMagazine, recentMagazine, downloadMagazine} = require('../helper/magazine');
const Magazine = require('../models/Magazine');
const Like = require('../models/Like');
const Reviews = require('../models/Reviews');

router.post('/upload', async(req, res) => {
    uploadMagazine(req, res, Magazine, User);
});

router.get('/view/:id', async(req, res) => {
    readMagazine(req, res, Magazine, Like, Reviews, User);
});

router.put('/update/:id', async(req, res) => {
    updateMagazine(req, res, Magazine, User);
});

router.delete('/delete/:id', async(req, res) => {
    deleteMagazine(req, res, Magazine, User);
});

router.post('/like/:id', async(req, res) => {
    toggleLikeMagazine(req, res, Magazine, Like, User);
});

router.get('/share/:id', async(req, res) => {
    shareMagazine(req, res, Magazine, User);
});

router.post('/comment/:id', async(req, res) => {
    commentMagazine(req, res, Magazine, Reviews, User);
});

router.get('/recent', async(req, res) => {
    recentMagazine(req, res, Magazine, User);
});

router.post('/download/:id', async(req, res) => {
    downloadMagazine(req, res, Magazine, User);
});

module.exports = router;