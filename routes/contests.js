const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
require('dotenv').config(); 
const {uploadCareers, readCareers, updateCareers, deleteCareers, shareCareers, applyCareers, recentCareers, topCareers} = require('../helper/contests');
const Careers = require('../models/Contests');
const Participant = require('../models/Participant');

router.post('/upload', async(req, res) => {
    uploadCareers(req, res, Careers, Participant, User);
});

router.get('/view/:id', async(req, res) => {
    readCareers(req, res, Careers, Participant, User);
});

router.put('/update/:id', async(req, res) => {
    updateCareers(req, res, Careers, Participant, User);
});

router.delete('/delete/:id', async(req, res) => {
    deleteCareers(req, res, Careers, Participant, User);
});

router.get('/share/:id', async(req, res) => {
    shareCareers(req, res, Careers, Participant, User);
});

router.post('/apply/:id', async(req, res) => {
    applyCareers(req, res, Careers, Participant, User);
});

router.get('/recent', async(req, res) => {
    recentCareers(req, res, Careers, Participant, User);
});

router.get('/top', async(req, res) => {
    topCareers(req, res, Careers, Participant, User);
});

module.exports = router;