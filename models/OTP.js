const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  createdAt: { type: Date, default: Date.now, expires: '5m' }, // OTP expires after 5 minutes
});

module.exports = mongoose.model('OTP', otpSchema);