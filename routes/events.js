const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
require('dotenv').config();
const {uploadEvents, readEvents, updateEvents, deleteEvents, toggleLikeEvents, shareEvents, commentEvents, recentEvents, topEvents} = require('../helper/events');
const Events = require('../models/Events');
const Like = require('../models/Like');
const Review = require('../models/Reviews');

router.post('/upload', async(req, res) => {
    uploadEvents(req, res, Events, Like, Review, User);
});

router.get('/view/:id', async(req, res) => {
    readEvents(req, res, Events, Like, Review, User);
});

router.put('/update/:id', async(req, res) => {
    updateEvents(req, res, Events, Like, Review, User);
});

router.delete('/delete/:id', async(req, res) => {
    deleteEvents(req, res, Events, Like, Review, User);
});

router.post('/like/:id', async(req, res) => {
    toggleLikeEvents(req, res, Events, Like, Review, User);
});

router.get('/share/:id', async(req, res) => {
    shareEvents(req, res, Events, Like, Review, User);
});

router.post('/comment/:id', async(req, res) => {
    commentEvents(req, res, Events, Like, Review, User);
});

router.get('/recent', async(req, res) => {
    recentEvents(req, res, Events, Like, Review, User);
});

router.get('/top', async(req, res) => {
    topEvents(req, res, Events, Like, Review, User);
});

module.exports = router;