const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now,
    },
    announcement: {
        type: String,
        require: true,
    },
});

module.exports = mongoose.model("Announcements", announcementSchema);