const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, restrictTo } = require('../middleware/auth');

// 1. Get All Categories (Used by the Product Dropdown)
router.get('/all', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Create a Category
router.post('/add', protect, restrictTo('admin'), async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.json({ message: "Category added successfully!" });
  } catch (err) {
    res.status(400).json({ message: "Category already exists" });
  }
});

// 3. Delete Category
router.delete('/delete/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
