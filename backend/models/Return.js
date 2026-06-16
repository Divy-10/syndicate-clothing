const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  email: { type: String, required: true },
  productName: { type: String, required: true },
  reason: { type: String, required: true },
  message: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Return', returnSchema);
