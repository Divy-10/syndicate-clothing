const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const delhivery = require('../services/delhivery');
const { protect } = require('../middleware/auth');

// Initialize Razorpay
// If dummy keys are configured, we print a warning and fallback gracefully
const isDummyKeys = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('dummykey');
let razorpayInstance = null;

if (!isDummyKeys) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } catch (err) {
    console.error('Failed to initialize Razorpay SDK:', err.message);
  }
}

// 1. Create Razorpay Order
router.post('/razorpay-order', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    // Amount in paise
    const amountInPaise = Math.round(amount * 100);

    if (isDummyKeys || !razorpayInstance) {
      console.log('ℹ️ Razorpay dummy mode active. Returning mock Razorpay order.');
      return res.json({
        success: true,
        orderId: `order_mock_${Date.now()}`,
        amount: amountInPaise,
        currency: 'INR',
        isMock: true,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykey123'
      });
    }

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ message: 'Razorpay order creation failed', error: err.message });
  }
});

// 2. Verify Razorpay Payment and Place Order
router.post('/razorpay-verify', protect, async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderDetails
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !orderDetails) {
      return res.status(400).json({ message: 'Missing verification or order details' });
    }

    // Signature verification check
    let verified = false;

    if (isDummyKeys || razorpay_order_id.startsWith('order_mock_')) {
      console.log('ℹ️ Razorpay dummy mode verification active.');
      verified = true; // Auto-verify mock orders for testing ease
    } else {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest('hex');
      verified = digest === razorpay_signature;
    }

    if (!verified) {
      console.log('❌ Razorpay signature verification failed!');
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    console.log('✅ Razorpay signature verified successfully.');

    // Save order in MongoDB
    const { userId, items, totalAmount, shippingAddress, couponCode, discountAmount } = orderDetails;

    // Create new order with status 'Confirmed' and paymentMethod 'Razorpay'
    const newOrder = new Order({
      userId,
      items,
      totalAmount,
      shippingAddress,
      couponCode,
      discountAmount: discountAmount || 0,
      paymentMethod: 'Razorpay',
      status: 'Confirmed' // Since payment is already completed online
    });

    const savedOrder = await newOrder.save();
    console.log("✅ Order successfully saved to DB (Razorpay). ID:", savedOrder._id);

    // Sync Stock: Subtract qty from each product sizes
    const stockUpdates = items.map(item => {
      const productId = item.productId || item._id;
      const sizeKey = item.selectedSize || item.size || 'S';
      return Product.findByIdAndUpdate(productId, {
        $inc: { [`stock.${sizeKey}`]: -item.qty }
      });
    });
    await Promise.all(stockUpdates);
    console.log("✅ STOCK UPDATED FOR ALL ITEMS");

    // Delhivery Shipment booking
    console.log("🚚 Registering shipment with Delhivery...");
    try {
      const delhiveryRes = await delhivery.createShipment(savedOrder);
      if (delhiveryRes && delhiveryRes.rm_errors) {
        console.error("❌ Delhivery Validation Errors:", delhiveryRes.rm_errors);
        savedOrder.delhiveryLogs.push({
          status: 'Failed',
          message: `Validation Error: ${JSON.stringify(delhiveryRes.rm_errors)}`
        });
      } else if (delhiveryRes && delhiveryRes.packages && delhiveryRes.packages.length > 0) {
        const pkg = delhiveryRes.packages[0];
        if (pkg.status === 'Success' && pkg.waybill) {
          savedOrder.awb = pkg.waybill;
          savedOrder.delhiveryStatus = 'Manifested';
          savedOrder.delhiveryLabelUrl = delhivery.getPackingSlipUrl(pkg.waybill);
          savedOrder.delhiveryLogs.push({
            status: 'Success',
            message: `Shipment created in Delhivery successfully. AWB: ${pkg.waybill}`
          });
          console.log(`✅ Delhivery Shipment Registered. AWB: ${pkg.waybill}`);
        } else {
          console.warn("⚠️ Delhivery package booking status other than Success:", pkg.remarks);
          savedOrder.delhiveryLogs.push({
            status: 'Failed',
            message: Array.isArray(pkg.remarks) ? pkg.remarks.join(" | ") : (pkg.remarks || 'Package booking failed')
          });
        }
      } else {
        console.warn("⚠️ Delhivery response did not contain packages:", delhiveryRes);
        savedOrder.delhiveryLogs.push({
          status: 'Failed',
          message: JSON.stringify(delhiveryRes)
        });
      }
      await savedOrder.save();
    } catch (dErr) {
      console.error("❌ Delhivery booking exception:", dErr);
      savedOrder.delhiveryLogs.push({
        status: 'Error',
        message: dErr.message
      });
      await savedOrder.save();
    }

    res.json({
      success: true,
      orderId: savedOrder._id,
      awb: savedOrder.awb,
      message: 'Payment verified and order placed successfully!'
    });

  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

module.exports = router;
