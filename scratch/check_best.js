const mongoose = require('mongoose');
const Product = require('./backend/models/Product');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

async function checkBestProducts() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/syndycate-clothing');
        console.log('Connected to MongoDB');
        
        const bestProducts = await Product.find({ isBestProduct: true });
        console.log(`Found ${bestProducts.length} Best Products:`);
        bestProducts.forEach(p => console.log(`- ${p.name} (ID: ${p._id})`));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkBestProducts();
