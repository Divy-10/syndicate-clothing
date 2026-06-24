const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  email: { type: String, required: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  pickupAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  productName: { type: String, required: true },
  reason: { type: String, required: true },
  message: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  awb: { type: String, default: null },
  delhiveryStatus: { type: String, default: null },
  delhiveryLogs: [
    {
      timestamp: { type: Date, default: Date.now },
      status: String,
      message: String
    }
  ],
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Return', returnSchema);
