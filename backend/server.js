require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const Sale = require('./models/Sale');
const Setting = require('./models/Setting');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mangocounter';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB');
    await initializeSettings();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Initialize default settings if they don't exist
async function initializeSettings() {
  try {
    const settingsCount = await Setting.countDocuments();
    if (settingsCount === 0) {
      const defaultSettings = new Setting({
        key: 'shop_settings',
        priceRateWeight: 1.5, // 1.5 kg
        priceRateAmount: 100, // 100 Rs
        currentStock: 500 // 500 kg
      });
      await defaultSettings.save();
      console.log('Initialized default settings: 1.5 kg = 100 Rs, stock = 500 kg');
    }
  } catch (err) {
    console.error('Error initializing settings:', err);
  }
}

// Helper to get active settings
async function getActiveSettings() {
  let settings = await Setting.findOne({ key: 'shop_settings' });
  if (!settings) {
    settings = new Setting({
      key: 'shop_settings',
      priceRateWeight: 1.5,
      priceRateAmount: 100,
      currentStock: 500
    });
    await settings.save();
  }
  return settings;
}

// --- API ROUTES ---

// 1. Settings Endpoints
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await getActiveSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const { priceRateWeight, priceRateAmount, currentStock } = req.body;
    const settings = await getActiveSettings();

    if (priceRateWeight !== undefined) settings.priceRateWeight = Number(priceRateWeight);
    if (priceRateAmount !== undefined) settings.priceRateAmount = Number(priceRateAmount);
    if (currentStock !== undefined) settings.currentStock = Number(currentStock);

    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update settings' });
  }
});

// 2. Sales Endpoints
app.get('/api/sales', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ date: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sales history' });
  }
});

app.post('/api/sales', async (req, res) => {
  try {
    const { buyerName, weight, status } = req.body;

    if (!buyerName || !weight) {
      return res.status(400).json({ error: 'Buyer name and weight are required' });
    }

    const settings = await getActiveSettings();

    // Calculate total amount based on active pricing rate
    // Cost = (weight / priceRateWeight) * priceRateAmount
    const rate = settings.priceRateAmount / settings.priceRateWeight;
    const calculatedAmount = Math.round((Number(weight) * rate) * 100) / 100;

    const newSale = new Sale({
      buyerName,
      weight: Number(weight),
      totalAmount: calculatedAmount,
      status: status || 'Paid'
    });

    // Deduct stock
    settings.currentStock = Math.max(0, settings.currentStock - Number(weight));

    await mongoose.connection.transaction(async (session) => {
      await newSale.save({ session });
      await settings.save({ session });
    });

    res.status(201).json({ sale: newSale, settings });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to record sale' });
  }
});

app.put('/api/sales/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { buyerName, weight, status } = req.body;

    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale record not found' });
    }

    const settings = await getActiveSettings();

    // If weight has changed, adjust the stock
    if (weight !== undefined && Number(weight) !== sale.weight) {
      const weightDiff = Number(weight) - sale.weight;
      // Adjust stock (if sale weight increased, stock decreases further)
      settings.currentStock = Math.max(0, settings.currentStock - weightDiff);

      sale.weight = Number(weight);
      // Recalculate price
      const rate = settings.priceRateAmount / settings.priceRateWeight;
      sale.totalAmount = Math.round((sale.weight * rate) * 100) / 100;
    }

    if (buyerName !== undefined) sale.buyerName = buyerName;
    if (status !== undefined) sale.status = status;

    await mongoose.connection.transaction(async (session) => {
      await sale.save({ session });
      await settings.save({ session });
    });

    res.json({ sale, settings });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update sale' });
  }
});

app.delete('/api/sales/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale record not found' });
    }

    const settings = await getActiveSettings();

    // Return the weight back to the stock
    settings.currentStock += sale.weight;

    await mongoose.connection.transaction(async (session) => {
      await Sale.findByIdAndDelete(id).session(session);
      await settings.save({ session });
    });

    res.json({ message: 'Sale deleted successfully', settings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete sale' });
  }
});

// 3. Analytics Endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const sales = await Sale.find();

    // Calculate total stats
    let totalRevenue = 0;
    let totalWeight = 0;
    let totalPaid = 0;
    let totalPending = 0;

    const customerStatsMap = {};

    // Get today's start date
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let todayRevenue = 0;
    let todayWeight = 0;

    sales.forEach(sale => {
      const amt = sale.totalAmount;
      const wt = sale.weight;

      totalRevenue += amt;
      totalWeight += wt;

      if (sale.status === 'Paid') {
        totalPaid += amt;
      } else {
        totalPending += amt;
      }

      // Check if sold today
      if (new Date(sale.date) >= todayStart) {
        todayRevenue += amt;
        todayWeight += wt;
      }

      // Customers grouping
      const nameKey = sale.buyerName.trim();
      if (!customerStatsMap[nameKey]) {
        customerStatsMap[nameKey] = { name: nameKey, totalSpent: 0, totalWeight: 0, orderCount: 0 };
      }
      customerStatsMap[nameKey].totalSpent += amt;
      customerStatsMap[nameKey].totalWeight += wt;
      customerStatsMap[nameKey].orderCount += 1;
    });

    // Sort customer list by amount spent to get top customers
    const topCustomers = Object.values(customerStatsMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    res.json({
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalWeight: Math.round(totalWeight * 100) / 100,
        totalPaid: Math.round(totalPaid * 100) / 100,
        totalPending: Math.round(totalPending * 100) / 100,
        todayRevenue: Math.round(todayRevenue * 100) / 100,
        todayWeight: Math.round(todayWeight * 100) / 100,
        salesCount: sales.length
      },
      topCustomers
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate analytics data' });
  }
});


module.exports = app;   // <-- Vercel will use this
