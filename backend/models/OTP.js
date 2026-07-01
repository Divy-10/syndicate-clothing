const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Auto-deletes from MongoDB after 5 minutes (300 seconds)
  }
});

module.exports = mongoose.model('OTP', otpSchema);
