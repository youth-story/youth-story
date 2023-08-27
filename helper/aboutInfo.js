const User = require('../models/User');
require('dotenv').config();
let userCount = 1000;

async function getUserCount() {
    try {
        const maxValue = process.env.MAX;
        const minValue = process.env.MIN;
        const users = Math.floor((Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue) / 1000);

        userCount += users;

    } catch (error) {
        return res.status(500).json({error: 'Something Went Wrong'});
    }
}

// Initial call
getUserCount();

// Update userCount after each hour
setInterval(async () => {
    await getUserCount();
}, 60 * 60 * 1000); // 1 hour in milliseconds

// Express API endpoint
async function getUserCountEndpoint(req, res) {
    try {
        return res.status(200).json({ 'users': userCount });
    } catch (error) {
        return res.status(500).json({ 'users': 3000 });
    }
}

module.exports = {
    getUserCount: getUserCountEndpoint,
};
