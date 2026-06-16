const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, restrictTo } = require('../middleware/auth');

// POST /api/sales/checkout
// Employee POS Checkout (deducts from unified stock)
router.post('/checkout', protect, restrictTo('admin', 'employee'), async (req, res) => {
  try {
    const { productId, quantity, size = 'S' } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Valid productId and quantity are required' });
    }

    // 1. Find the product
    let product;
    if (productId.length === 12) { // Barcode length
      product = await Product.findOne({ barcodeId: productId });
    } else {
      product = await Product.findById(productId);
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 2. Check if there is enough stock
    let sizeStock = 0;
    const currentStock = product.stock;
    if (currentStock instanceof Map) {
      sizeStock = currentStock.get(size) || 0;
    } else if (currentStock && typeof currentStock === 'object') {
      sizeStock = currentStock[size] || 0;
    } else {
      sizeStock = Number(product.stock) || 0;
    }

    if (sizeStock < quantity) {
      return res.status(400).json({ message: `Not enough stock for size ${size}!` });
    }

    // 3. Subtract the stock
    if (currentStock instanceof Map) {
      currentStock.set(size, sizeStock - quantity);
    } else if (currentStock && typeof currentStock === 'object') {
      currentStock[size] = sizeStock - quantity;
      product.markModified('stock');
    } else {
      product.stock -= quantity;
    }
    await product.save();

    // 4. Emit socket event for real-time website update
    const io = req.app.get('io');
    if (io) {
      io.emit('stockUpdate', {
        productId: product._id,
        stock: product.stock
      });
    }

    // 5. Send success response
    res.json({ message: 'Sale completed and stock updated!', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
