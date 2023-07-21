const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
require('dotenv').config();
const Announcements = require('../models/Announcements');
const {createAnnouncements, getAnnouncement, deleteAnnouncement} = require('../helper/announcements');

router.post('/create-announcement', requireAuth, async(req, res) => {
    createAnnouncements(req, res, Announcements, User);
});

router.get('/get-announcements', requireAuth, async(req, res) => {
    getAnnouncement(req, res, Announcements, User);
});

router.delete('/delete-announcement', requireAuth, async(req, res) => {
    deleteAnnouncement(req, res, Announcements, User);
});

module.exports = router;