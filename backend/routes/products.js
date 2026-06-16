const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, restrictTo } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Must match the folder name exactly
  },
  filename: (req, file, cb) => {
    // Creates a unique name: 1623456789-123456789.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// GET /api/products — List all products (PUBLIC)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/best — List only best products (PUBLIC)
router.get('/best', async (req, res) => {
  try {
    const products = await Product.find({ isBestProduct: true }).sort({ createdAt: -1 });
    console.log(`Best Products Found: ${products.length}`); // DEBUG LOG
    res.json(products);
  } catch (error) {
    console.error("Error fetching best products:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/:id — Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('styleWith');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/products or /api/products/add — Create product
const createProductHandler = async (req, res) => {
  try {
    const hasImage = req.files && ((req.files['image'] && req.files['image'][0]) || (req.files['images'] && req.files['images'].length > 0));
    if (!req.body.name || !req.body.price || !req.body.category || !hasImage) {
      return res.status(400).json({ 
        message: "Missing required fields. Please provide name, price, category, and image." 
      });
    }

    let productData = { ...req.body };

    // Handle uploaded files
    if (req.files) {
      const uploadedImages = [];

      // Handle single main image (for backward compatibility)
      if (req.files['image'] && req.files['image'][0]) {
        const imagePath = `/uploads/${req.files['image'][0].filename}`;
        productData.image = imagePath;
        uploadedImages.push(imagePath);
      }

      // Handle multiple images
      if (req.files['images']) {
        req.files['images'].forEach(file => {
          uploadedImages.push(`/uploads/${file.filename}`);
        });
      }

      if (uploadedImages.length > 0) {
        productData.images = uploadedImages;
        if (!productData.image) {
          productData.image = uploadedImages[0];
        }
      }
    }

    // Remove empty fields to allow Mongoose defaults/pre-save hooks to work
    if (!productData.sku || productData.sku.trim() === '') delete productData.sku;
    if (!productData.barcodeId || productData.barcodeId.trim() === '') delete productData.barcodeId;

    // Ensure numeric values
    if (productData.price) productData.price = Number(productData.price);
    if (productData.stock) {
      if (typeof productData.stock === 'string' && productData.stock.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(productData.stock);
          const stockMap = {};
          Object.keys(parsed).forEach(k => {
            stockMap[k] = Number(parsed[k]) || 0;
          });
          productData.stock = stockMap;
        } catch (e) {
          console.error("Failed to parse stock JSON:", e);
          productData.stock = {};
        }
      } else {
        productData.stock = Number(productData.stock);
      }
    }

    // Parse array fields that come as comma-separated strings from FormData
    if (typeof productData.colors === 'string' && productData.colors.trim() !== '') {
      productData.colors = productData.colors.split(',').map(c => ({ name: c.trim(), hex: '#000000' }));
    }
    if (typeof productData.sizes === 'string' && productData.sizes.trim() !== '') {
      productData.sizes = productData.sizes.split(',').map(s => s.trim());
    }

    const product = new Product(productData);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('POST /products validation error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate SKU or barcode. Please try again.' });
    }
    res.status(400).json({ message: error.message });
  }
};

const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]);

router.post('/', protect, restrictTo('admin'), uploadFields, createProductHandler);
router.post('/add', protect, restrictTo('admin'), uploadFields, createProductHandler);

// PATCH /api/products/update-stock — Sync stock from web or shop
router.patch('/update-stock', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { productId, quantityChange } = req.body;

    if (!productId || quantityChange === undefined) {
      return res.status(400).json({
        message: 'productId and quantityChange are required',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const size = req.body.size || 'S';
    const currentStock = product.stock;

    if (currentStock instanceof Map) {
      const currentVal = currentStock.get(size) || 0;
      const newVal = currentVal + Number(quantityChange);
      if (newVal < 0) {
        return res.status(400).json({ message: `Insufficient stock for size ${size}` });
      }
      currentStock.set(size, newVal);
    } else if (currentStock && typeof currentStock === 'object') {
      const currentVal = currentStock[size] || 0;
      const newVal = currentVal + Number(quantityChange);
      if (newVal < 0) {
        return res.status(400).json({ message: `Insufficient stock for size ${size}` });
      }
      currentStock[size] = newVal;
      product.markModified('stock');
    } else {
      const newValue = Number(product.stock) + Number(quantityChange);
      if (newValue < 0) {
        return res.status(400).json({ message: `Insufficient stock` });
      }
      product.stock = newValue;
    }

    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/products/update-stock/:id — Update entire stock object
router.patch('/update-stock/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { stock } = req.body;
    const sanitizedStock = {};
    if (stock && typeof stock === 'object') {
      Object.keys(stock).forEach(size => {
        sanitizedStock[size] = Number(stock[size]) || 0;
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: sanitizedStock },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ success: true, product: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: "Failed to update stock" });
  }
});

// PUT /api/products/:id — Update product
router.put('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/products/:id — Delete product
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/products/toggle-best/:id — Toggle best status
router.patch('/toggle-best/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const newStatus = !product.isBestProduct;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { isBestProduct: newStatus },
      { new: true }
    );

    console.log(`Database Updated: ${updatedProduct.name} isBestProduct = ${newStatus}`);
    res.json(updatedProduct);
  } catch (error) {
    console.error("Toggle Best Error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
