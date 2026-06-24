const express = require('express');
const router = express.Router();
const Return = require('../models/Return');
const Order = require('../models/Order');
const delhivery = require('../services/delhivery');
const { protect, restrictTo } = require('../middleware/auth');

// GET /api/returns/lookup-order — Look up shipping details of an order for returns auto-fill
router.get('/lookup-order', async (req, res) => {
  try {
    const { orderId, email } = req.query;
    if (!orderId || !email) {
      return res.status(400).json({ message: "Order ID and email are required" });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid Order ID format" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.shippingAddress?.email?.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ message: "Email does not match this order" });
    }

    res.json({
      customerName: order.shippingAddress.fullName || '',
      phone: order.shippingAddress.phone || '',
      pickupAddress: order.shippingAddress.address || '',
      city: order.shippingAddress.city || '',
      state: order.shippingAddress.state || '',
      pincode: order.shippingAddress.pincode || '',
      products: order.items.map(item => `${item.name} (${item.size || 'N/A'})`).join(', ')
    });
  } catch (err) {
    console.error("Order lookup error:", err);
    res.status(500).json({ message: "Server error occurred during lookup" });
  }
});

// POST /api/returns/request — Submit a return request and book reverse pickup in Delhivery
router.post('/request', async (req, res) => {
  try {
    const returnData = req.body;
    
    // Create new Return request locally
    const newReturn = new Return(returnData);

    console.log("Booking reverse pickup in Delhivery One...");
    const delhiveryRes = await delhivery.createReverseShipment(returnData);

    if (delhiveryRes && delhiveryRes.packages && delhiveryRes.packages.length > 0) {
      const pkg = delhiveryRes.packages[0];
      newReturn.awb = pkg.waybill;
      newReturn.delhiveryStatus = "Booked";
      newReturn.delhiveryLogs.push({
        status: "Booked",
        message: `Reverse pickup registered successfully. Waybill AWB: ${pkg.waybill}`
      });
      console.log(`Delhivery reverse pickup created successfully. AWB: ${pkg.waybill}`);
    } else {
      console.warn("Delhivery Reverse Shipment creation returned no package. Saving return as pending without AWB.");
      newReturn.delhiveryLogs.push({
        status: "Failed",
        message: "Failed to automatically book with Delhivery: " + JSON.stringify(delhiveryRes)
      });
    }

    await newReturn.save();
    
    res.status(201).json({ 
      message: "Return request submitted successfully!",
      awb: newReturn.awb 
    });
  } catch (err) {
    console.error("Return Request Error:", err);
    res.status(500).json({ message: "Server error occurred" });
  }
});

// GET /api/returns/admin — View all return requests (Admin Only)
router.get('/admin', protect, restrictTo('admin'), async (req, res) => {
  try {
    const requests = await Return.find().sort({ date: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching return requests" });
  }
});

module.exports = router;
