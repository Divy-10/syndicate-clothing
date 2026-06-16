const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedAdmin = require('./seed/adminSeed');
const path = require('path');

const fs = require('fs');
const ExcelJS = require('exceljs');

dotenv.config();

// Auto-create uploads and user_tryons folders if they don't exist
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
    console.log("Uploads folder created successfully!");
}


const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://elbrosyndicate.com',
  'http://elbrosyndicate.com',
  'https://www.elbrosyndicate.com',
  'http://www.elbrosyndicate.com',
  'https://elbro-syndicate.vercel.app'
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io available to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    console.log("Incoming Origin:", origin);

    if (!origin) return callback(null, true);

    if (!allowedOrigins.includes(origin)) {
      console.log("Blocked Origin:", origin);
      return callback(new Error("The CORS policy for this site does not allow access from the specified Origin."));
    }

    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Routes
const Order = require('./models/Order');
const Address = require('./models/Address');
const Product = require('./models/Product');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/returns', require('./routes/returns'));
app.use('/api/address', require('./routes/address'));
app.use('/api/coupons', require('./routes/coupons'));

// --- ORDER ROUTE (Fixes the 404 error) ---
app.post('/api/orders/place', async (req, res) => {
  console.log("--- NEW ORDER REQUEST RECEIVED ---");
  console.log("Data:", req.body); 
  try {
    const { userId, items, totalAmount, shippingAddress, couponCode, discountAmount } = req.body;

    // 1. Basic Validation
    if (!userId || !items || items.length === 0) {
      console.log("❌ ERROR: Missing order details (userId or items)");
      return res.status(400).json({ message: "Missing order details" });
    }

    // 2. Create the Order in Database
    const newOrder = new Order({
      userId,
      items,
      totalAmount,
      shippingAddress,
      couponCode,
      discountAmount: discountAmount || 0,
      paymentMethod: 'COD' // Set to COD by default
    });

    const savedOrder = await newOrder.save();
    console.log("✅ Order successfully saved to DB. ID:", savedOrder._id);

    // 3. SYNC STOCK: Subtract the quantity from each product in the order
    const stockUpdates = items.map(item => {
      const productId = item.productId || item._id; // Handle both key names
      const sizeKey = item.selectedSize || item.size || 'S';
      return Product.findByIdAndUpdate(productId, {
        $inc: { [`stock.${sizeKey}`]: -item.qty } // DYNAMIC KEY update
      });
    });

    await Promise.all(stockUpdates);
    console.log("✅ STOCK UPDATED FOR ALL ITEMS");

    res.status(200).json({ 
      success: true, 
      orderId: savedOrder._id, 
      message: "Order placed and stock updated!" 
    });

  } catch (error) {
    console.error("❌ DATABASE ERROR:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route for Admin to see all orders
app.get('/api/admin/orders', async (req, res) => {
  try {
    // .populate('userId') replaces the ID with the User's actual name and email
    const orders = await Order.find()
      .populate('userId', 'name email') 
      .sort({ createdAt: -1 }); // Newest orders first
      
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Route for Admin dashboard stats
const getAdminStats = async (req, res) => {
  try {
    const now = new Date();
    
    // 1. Total Revenue & Total Orders
    const totalStats = await Order.aggregate([
      { $group: { _id: null, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
    ]);

    // 2. Monthly Revenue (Last 30 Days)
    const thirtyDaysAgo = new Date(new Date().setDate(now.getDate() - 30));
    const monthlyStats = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" } } }
    ]);

    // 3. Weekly Revenue (Last 7 Days)
    const sevenDaysAgo = new Date(new Date().setDate(now.getDate() - 7));
    const weeklyStats = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" } } }
    ]);

    res.json({
      totalRevenue: totalStats[0]?.revenue || 0,
      totalOrders: totalStats[0]?.count || 0,
      monthlyRevenue: monthlyStats[0]?.revenue || 0,
      weeklyRevenue: weeklyStats[0]?.revenue || 0,
    });
  } catch (err) {
    console.error("Stats API Error:", err);
    res.status(500).json({ message: "Error fetching stats" });
  }
};

app.get('/api/admin/stats', getAdminStats);
app.post('/api/admin/stats', getAdminStats);

app.get('/api/admin/full-report', async (req, res) => {
  try {
    // 1. Total Revenue and Orders
    const generalStats = await Order.aggregate([
      { $group: { _id: null, totalRev: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } }
    ]);

    // 2. Top Selling Products (Count occurrences of each productId)
    const productStats = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.name", count: { $sum: "$items.qty" }, revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 3. Category Performance
    // We join the Order items with the Product collection to get the category
    const categoryStats = await Order.aggregate([
      { $unwind: "$items" },
      { $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'prodDetails' } },
      { $unwind: '$prodDetails' },
      { $group: { _id: '$prodDetails.category', revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } } } },
      { $sort: { revenue: -1 } }
    ]);

    res.json({
      overview: generalStats[0] || { totalRev: 0, totalOrders: 0 },
      topProducts: productStats,
      categoryPerformance: categoryStats
    });
  } catch (err) {
    console.error("Full Report API Error:", err);
    res.status(500).json({ message: "Report generation failed" });
  }
});

// COMBINED STATS & REPORT ROUTE
app.get('/api/admin/dashboard-data', async (req, res) => {
  try {
    const now = new Date();
    
    // General Stats
    const generalStats = await Order.aggregate([
      { $group: { _id: null, totalRev: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } }
    ]);

    // Monthly/Weekly
    const thirtyDaysAgo = new Date(new Date().setDate(now.getDate() - 30));
    const monthlyStats = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" } } }
    ]);

    // Top Products
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.name", count: { $sum: "$items.qty" }, revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Category Performance
    const categoryStats = await Order.aggregate([
      { $unwind: "$items" },
      { $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'prod' } },
      { $unwind: '$prod' },
      { $group: { _id: '$prod.category', revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } } } },
      { $sort: { revenue: -1 } }
    ]);

    res.json({
      overview: generalStats[0] || { totalRev: 0, totalOrders: 0 },
      monthlyRevenue: monthlyStats[0]?.revenue || 0,
      topProducts,
      categoryPerformance: categoryStats
    });
  } catch (err) {
    console.error("Dashboard Combined Data Error:", err);
    res.status(500).json({ message: "Data fetch failed" });
  }
});

// THE PREVIEW ROUTE (Returns JSON to show in browser)
app.get('/api/admin/report-preview', async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    if (isNaN(m) || isNaN(y)) {
      return res.status(400).json({ message: "Invalid month or year provided" });
    }

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0);
    endDate.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('userId');

    // Map the data to a clean format for the table
    const reportData = orders.map(order => ({
      orderId: order._id,
      customer: order.userId?.name || 'Guest',
      total: order.totalAmount,
      status: order.status,
      date: order.createdAt.toLocaleDateString()
    }));

    res.json(reportData);
  } catch (err) {
    console.error("Report Preview Error:", err);
    res.status(500).json({ message: "Preview failed" });
  }
});

// This route provides the data for printing the report
app.get('/api/admin/print-report', async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    if (isNaN(m) || isNaN(y)) {
      return res.status(400).json({ message: "Invalid month or year provided" });
    }

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0);
    endDate.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('userId');

    const formattedData = orders.map(order => ({
      orderId: order._id.toString(),
      customer: order.userId?.name || 'Guest',
      total: order.totalAmount,
      status: order.status,
      date: order.createdAt.toLocaleDateString()
    }));

    res.json(formattedData);
  } catch (err) {
    console.error("Print Report Data Error:", err);
    res.status(500).json({ message: "Error fetching report data" });
  }
});

// ROUTE: Update Order Status
app.patch('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // Status comes from the dropdown (e.g., "Dispatch")
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      { status: status }, 
      { new: true }
    );

    res.json({ success: true, order: updatedOrder });
  } catch (err) {
    res.status(500).json({ message: "Error updating order status" });
  }
});

// ROUTE: Get Orders for a specific user
app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user orders" });
  }
});




// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Welcome to El Bro Syndicate API',
    timestamp: new Date().toISOString() 
  });
});

const PORT = process.env.PORT || 5000;

// Connect to DB, seed admin, then start server
connectDB().then(async () => {
  await seedAdmin();

  io.on('connection', (socket) => {
    console.log('Client connected to socket.io');
    socket.on('disconnect', () => {
      console.log('Client disconnected from socket.io');
    });
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
