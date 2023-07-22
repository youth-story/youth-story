const mongoose = require('mongoose');

const newsLetterSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('NewsLetter', newsLetterSchema);