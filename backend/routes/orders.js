const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

// @desc    Place a new order
// @route   POST /api/orders/place
// @access  Private
router.post('/place', protect, async (req, res) => {
  console.log("Order Request Received:", req.body); // DEBUG LOG
  try {
    const { items, totalAmount, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    // 1. Create the Order
    const newOrder = new Order({
      userId: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: 'COD'
    });
    await newOrder.save();

    // 2. IMPORTANT: Subtract Stock for each item sold
    for (let item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.qty }
      });
    }

    res.status(200).json({ success: true, orderId: newOrder._id });
  } catch (err) {
    console.error("Order Placement Error:", err);
    res.status(500).json({ message: "Order placement failed" });
  }
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

module.exports = router;
