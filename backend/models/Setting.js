const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'shop_settings'
  },
  priceRateWeight: {
    type: Number,
    required: true,
    default: 1.5, // default: 1.5 kg
    min: [0.01, 'Weight rate must be greater than 0']
  },
  priceRateAmount: {
    type: Number,
    required: true,
    default: 100, // default: 100 Rs
    min: [0.01, 'Price rate must be greater than 0']
  },
  currentStock: {
    type: Number,
    required: true,
    default: 500, // default stock in kg
    min: [0, 'Stock cannot be negative']
  }
});

module.exports = mongoose.model('Setting', settingSchema);
