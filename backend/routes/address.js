const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const { protect } = require('../middleware/auth');

// GET /api/address/user/:userId — Get saved address for user
router.get('/user/:userId', protect, async (req, res) => {
  let targetUserId = req.params.userId;
  if (targetUserId === 'undefined' || !targetUserId) {
    targetUserId = req.user?._id;
  }
  console.log(`[Backend API] GET /api/address/user/${req.params.userId} requested. Using targetUserId: ${targetUserId}`);
  try {
    const address = await Address.findOne({ userId: targetUserId }).sort({ isDefault: -1, updatedAt: -1 });
    console.log(`[Backend API] Found address in DB:`, address);
    res.json(address);
  } catch (error) {
    console.error(`[Backend API] Error fetching address:`, error);
    res.status(500).json({ message: 'Error fetching address' });
  }
});

// POST /api/address/save — Save or update address
router.post('/save', protect, async (req, res) => {
  const userId = req.body.userId || req.user?._id;
  console.log(`[Backend API] POST /api/address/save requested. Using userId: ${userId}. Body:`, req.body);
  try {
    // Sanitize body to prevent immutable field errors (like _id) during updates
    const updateData = { ...req.body, userId };
    delete updateData._id;
    delete updateData.__v;

    let address = await Address.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    console.log(`[Backend API] Address successfully saved/updated in DB:`, address);
    res.json({ message: 'Address saved successfully!', address });
  } catch (error) {
    console.error("[Backend API] Error saving address:", error);
    res.status(500).json({ message: 'Error saving address' });
  }
});

module.exports = router;
