const express = require('express');
const router = express.Router();
const Return = require('../models/Return');
const { protect, restrictTo } = require('../middleware/auth');

// POST /api/returns/request — Submit a return request
router.post('/request', async (req, res) => {
  try {
    const newReturn = new Return(req.body);
    await newReturn.save();
    res.status(201).json({ message: "Return request submitted successfully!" });
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
