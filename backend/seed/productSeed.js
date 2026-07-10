const Product = require('../models/Product');

const productsToSeed = [
  {
    name: 'Structural Silk Shirt',
    price: 8499,
    description: 'Minimalist relaxed drape shirt in pure washed mulberry silk. Designed with clean architectural lines.',
    category: 'Tops',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Noir Black', hex: '#000000' },
      { name: 'Chalk White', hex: '#FFFFFF' }
    ],
    image: '/assets/images/model-silk-shirt.jpg',
    images: ['/assets/images/model-silk-shirt.jpg'],
    stock: { 'S': 10, 'M': 15, 'L': 10, 'XL': 5 },
    isBestProduct: true
  },
  {
    name: 'Asynchronous Overcoat',
    price: 18999,
    description: 'A heavyweight double-breasted overcoat crafted from raw virgin wool with geometric pocketing.',
    category: 'Outerwear',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Charcoal Noir', hex: '#1C1C1C' }
    ],
    image: '/assets/images/luxury-shop1.png',
    images: ['/assets/images/luxury-shop1.png'],
    stock: { 'S': 5, 'M': 8, 'L': 6, 'XL': 3 },
    isBestProduct: true
  },
  {
    name: 'Noir Architectural Trousers',
    price: 11999,
    description: 'Double pleat trousers featuring custom architectural volume and a structured silhouette.',
    category: 'Bottoms',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Matte Black', hex: '#0B0B0B' }
    ],
    image: '/assets/images/luxury-shop.png',
    images: ['/assets/images/luxury-shop.png'],
    stock: { 'S': 12, 'M': 20, 'L': 15, 'XL': 8 },
    isBestProduct: true
  },
  {
    name: 'Geometric Slouchy Hoodie',
    price: 7999,
    description: 'Boxy fit heavy loopback cotton hoodie in pure charcoal black. Finished with signature drop shoulder seam.',
    category: 'Outerwear',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Charcoal Black', hex: '#262626' }
    ],
    image: '/assets/images/luxury-shop.png',
    images: ['/assets/images/luxury-shop.png'],
    stock: { 'S': 15, 'M': 25, 'L': 20, 'XL': 10 },
    isBestProduct: false
  },
  {
    name: 'Minimalist Draped Dress',
    price: 14999,
    description: 'Fluid column dress featuring custom geometric side pleats, built from organic jersey cotton.',
    category: 'Dresses',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Pure Noir', hex: '#000000' }
    ],
    image: '/assets/images/luxury-shop1.png',
    images: ['/assets/images/luxury-shop1.png'],
    stock: { 'S': 8, 'M': 12, 'L': 10, 'XL': 4 },
    isBestProduct: true
  }
];

const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('No products found in database. Seeding initial products...');
      await Product.insertMany(productsToSeed);
      console.log('Successfully seeded 5 initial premium products!');
    } else {
      console.log(`Database already has ${count} products. Skipping product seeding.`);
    }
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

module.exports = seedProducts;
