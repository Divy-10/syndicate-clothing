const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'Uncategorized',
    },
    sizes: {
      type: [String],
      default: ['S', 'M', 'L', 'XL'],
    },
    colors: [
      {
        name: { type: String },
        hex: { type: String },
      },
    ],
    images: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
    },
    stock: {
      type: Map,
      of: Number,
      default: { 'S': 0, 'M': 0, 'L': 0, 'XL': 0 }
    },
    barcodeId: {
      type: String,
      unique: true,
    },
    styleWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    isBestProduct: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


// Pre-save: auto-generate SKU and barcodeId
productSchema.pre('save', function () {
  if (!this.sku) {
    const prefix = 'SYN';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.sku = `${prefix}-${timestamp}-${random}`;
  }
  if (!this.barcodeId) {
    // Generate a 12-digit numeric string
    this.barcodeId = Array.from({ length: 12 }, () =>
      Math.floor(Math.random() * 10)
    ).join('');
  }
  if (this.image && (!this.images || this.images.length === 0)) {
    this.images = [this.image];
  }
});

module.exports = mongoose.model('Product', productSchema);
