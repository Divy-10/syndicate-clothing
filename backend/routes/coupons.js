const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/auth');

// 1. PUBLIC: Get all active coupons (to display on the product detail page)
router.get('/active', async (req, res) => {
  try {
    const today = new Date();
    // Fetch coupons that are active and not expired (or have no expiry date)
    const coupons = await Coupon.find({
      isActive: true,
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gte: today } }
      ]
    }).sort({ createdAt: -1 });

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active coupons' });
  }
});

// 2. PUBLIC: Validate a coupon code and get discount details
router.post('/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon code not found' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: 'This coupon is no longer active' });
    }

    const today = new Date();
    if (coupon.expiryDate && new Date(coupon.expiryDate) < today) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount of ₹${coupon.minOrderAmount.toLocaleString()} is required for this coupon` 
      });
    }

    res.json({
      success: true,
      code: coupon.code,
      discount: coupon.discount,
      discountType: coupon.discountType,
      message: 'Coupon code applied successfully!'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error validating coupon code' });
  }
});

// 3. ADMIN: Get all coupons
router.get('/', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons' });
  }
});

// 4. ADMIN: Create a new coupon
router.post('/', protect, admin, async (req, res) => {
  try {
    const { code, discount, discountType, minOrderAmount, expiryDate, isActive } = req.body;

    if (!code || !discount) {
      return res.status(400).json({ message: 'Code and discount value are required' });
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      discount,
      discountType: discountType || 'percentage',
      minOrderAmount: minOrderAmount || 0,
      expiryDate: expiryDate || null,
      isActive: isActive !== undefined ? isActive : true
    });

    const savedCoupon = await newCoupon.save();
    res.status(201).json(savedCoupon);
  } catch (error) {
    res.status(500).json({ message: 'Error creating coupon' });
  }
});

// 5. ADMIN: Toggle active status
router.patch('/:id/status', protect, admin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!updatedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ message: 'Error updating coupon status' });
  }
});

// 6. ADMIN: Delete a coupon
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!deletedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting coupon' });
  }
});

module.exports = router;
