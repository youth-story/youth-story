const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
require('dotenv').config();
const {uploadArticle, readArticle, updateArticle, deleteArticle, toggleLikeArticle, shareArticle, commentArticle, recentArticle, topArticle} = require('../helper/articles');
const Article = require('../models/Article');
const Like = require('../models/Like');
const Review = require('../models/Reviews');

router.post('/upload', async(req, res) => {
    uploadArticle(req, res, Article, User);
});

router.get('/view/:id', async(req, res) => {
    readArticle(req, res, Article, User);
});

router.put('/update/:id', async(req, res) => {
    updateArticle(req, res, Article, User);
});

router.delete('/delete/:id', async(req, res) => {
    deleteArticle(req, res, Article, User);
});

router.post('/toggle-like/:id', async(req, res) => {
    toggleLikeArticle(req, res, Article, Like, User);
});

router.get('/share/:id', async(req, res) => {
    shareArticle(req, res, Article, User);
});

router.post('/comment/:id', async(req, res) => {
    commentArticle(req, res, Article, Review, User);
});

router.get('/top', async(req, res) => {
    topArticle(req, res, Article, User);
});

router.get('/recent', async(req, res) => {
    recentArticle(req, res, Article, User);
});

module.exports = router;