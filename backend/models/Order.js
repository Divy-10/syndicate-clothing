const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      qty: { type: Number, required: true },
      size: String
    }
  ],
  totalAmount: { type: Number, required: true },
  couponCode: { type: String },
  discountAmount: { type: Number, default: 0 },
  shippingAddress: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  paymentMethod: { type: String, default: 'COD' },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Processing', 'Dispatch', 'Transit', 'Shipped', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  awb: { type: String, default: null },
  delhiveryStatus: { type: String, default: null },
  delhiveryLabelUrl: { type: String, default: null },
  delhiveryLogs: [
    {
      timestamp: { type: Date, default: Date.now },
      status: String,
      message: String
    }
  ],
  createdAt: { type: Date, default: Date.now }

});

module.exports = mongoose.model('Order', orderSchema);
