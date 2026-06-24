const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  buyerName: {
    type: String,
    required: [true, 'Buyer name is required'],
    trim: true
  },
  weight: {
    type: Number,
    required: [true, 'Weight in kg is required'],
    min: [0.01, 'Weight must be greater than 0']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Paid'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Sale', saleSchema);
