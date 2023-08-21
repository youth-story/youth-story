const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
require('dotenv').config(); 
const {uploadInterviews, readInterviews, updateInterviews, deleteInterviews, toggleLikeInterviews, shareInterviews, commentInterviews, recentInterviews, topInterviews} = require('../helper/interviews');
const Interviews = require('../models/Interviews');
const Like = require('../models/Like');
const Review = require('../models/Reviews');

router.post('/upload', async(req, res) => {
    uploadInterviews(req, res, Interviews, Like, Review, User);
});

router.get('/view/:id', async(req, res) => {
    readInterviews(req, res, Interviews, Like, Review, User);
});

router.put('/update/:id', async(req, res) => {
    updateInterviews(req, res, Interviews, Like, Review, User);
});

router.delete('/delete/:id', async(req, res) => {
    deleteInterviews(req, res, Interviews, Like, Review, User);
});

router.post('/like/:id', async(req, res) => {
    toggleLikeInterviews(req, res, Interviews, Like, Review, User);
});

router.get('/share/:id', async(req, res) => {
    shareInterviews(req, res, Interviews, Like, Review, User);
});

router.post('/comment/:id', async(req, res) => {
    commentInterviews(req, res, Interviews, Like, Review, User);
});

router.get('/recent', async(req, res) => {
    recentInterviews(req, res, Interviews, Like, Review, User);
});

router.get('/top', async(req, res) => {
    topInterviews(req, res, Interviews, Like, Review, User);
});

module.exports = router;