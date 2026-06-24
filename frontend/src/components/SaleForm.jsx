import React, { useState, useEffect } from 'react';
import { User, Weight, CheckCircle, Clock, ShoppingCart } from 'lucide-react';

function SaleForm({ settings, onRecordSale }) {
  const [buyerName, setBuyerName] = useState('');
  const [weight, setWeight] = useState('');
  const [status, setStatus] = useState('Paid'); // 'Paid' or 'Pending'
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  const priceRateWeight = settings.priceRateWeight || 1.5;
  const priceRateAmount = settings.priceRateAmount || 100;
  const currentStock = settings.currentStock || 0;

  // Calculate price dynamically whenever weight or pricing settings change
  useEffect(() => {
    const w = parseFloat(weight);
    if (!isNaN(w) && w > 0) {
      const rate = priceRateAmount / priceRateWeight;
      const price = w * rate;
      // Round to 2 decimal places
      setCalculatedPrice(Math.round(price * 100) / 100);
    } else {
      setCalculatedPrice(0);
    }
  }, [weight, priceRateAmount, priceRateWeight]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!buyerName.trim()) return;
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return;

    onRecordSale({
      buyerName: buyerName.trim(),
      weight: w,
      status
    });

    // Reset Form
    setBuyerName('');
    setWeight('');
    setStatus('Paid');
  };

  const handleQuickAdd = (amountToAdd) => {
    const currentVal = parseFloat(weight) || 0;
    const newVal = currentVal + amountToAdd;
    // Set to 2 decimal places to avoid float issues
    setWeight((Math.round(newVal * 100) / 100).toString());
  };

  const handleSetPreset = (presetVal) => {
    setWeight(presetVal.toString());
  };

  const isStockExceeded = parseFloat(weight) > currentStock;

  return (
    <div className="card">
      <h3 className="card-title">
        <ShoppingCart size={22} className="action-btn-paid" />
        Record New Sale
      </h3>
      <form onSubmit={handleSubmit}>
        
        {/* Buyer Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="buyerName">Buyer Name</label>
          <div className="input-wrapper">
            <span style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }}>
              <User size={18} />
            </span>
            <input
              id="buyerName"
              type="text"
              className="form-input"
              style={{ paddingLeft: '44px' }}
              placeholder="Who is buying?"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Mango Weight (kg) */}
        <div className="form-group">
          <label className="form-label" htmlFor="weight">Weight (Quantity)</label>
          <div className="input-wrapper">
            <span style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }}>
              <Weight size={18} />
            </span>
            <input
              id="weight"
              type="number"
              step="0.01"
              min="0.01"
              className="form-input"
              style={{ paddingLeft: '44px', paddingRight: '48px' }}
              placeholder="0.0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
            <span className="input-addon">kg</span>
          </div>

          {/* Quick Add Presets */}
          <div className="presets-grid">
            <button type="button" className="preset-btn" onClick={() => handleSetPreset(0.5)}>0.5 kg</button>
            <button type="button" className="preset-btn" onClick={() => handleSetPreset(1.0)}>1.0 kg</button>
            <button type="button" className="preset-btn" onClick={() => handleSetPreset(1.5)}>1.5 kg</button>
            <button type="button" className="preset-btn" onClick={() => handleSetPreset(3.0)}>3.0 kg</button>
            <button type="button" className="preset-btn" onClick={() => handleQuickAdd(1.0)}>+1 kg</button>
          </div>
        </div>

        {/* Payment Status Toggle */}
        <div className="form-group">
          <label className="form-label">Payment Status</label>
          <div className="select-wrapper">
            <button
              type="button"
              className={`select-btn ${status === 'Paid' ? 'active' : ''}`}
              onClick={() => setStatus('Paid')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} /> Paid
              </span>
            </button>
            <button
              type="button"
              className={`select-btn ${status === 'Pending' ? 'active' : ''}`}
              onClick={() => setStatus('Pending')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} /> Pending
              </span>
            </button>
          </div>
        </div>

        {/* Real-time Calculation Display */}
        <div className="price-display-box">
          <div className="price-display-label">Calculated Total</div>
          <div className="price-display-amount">₹{calculatedPrice}</div>
          <div className="price-display-formula">
            Rate: {priceRateAmount} Rs for {priceRateWeight} kg 
            (₹{(priceRateAmount / priceRateWeight).toFixed(2)}/kg)
          </div>
          {isStockExceeded && (
            <div style={{ color: 'var(--color-warning)', fontSize: '0.8rem', fontWeight: '700', marginTop: '10px' }}>
              ⚠️ Exceeds active stock of {currentStock} kg!
            </div>
          )}
        </div>

        {/* Submit */}
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={!buyerName.trim() || !weight || parseFloat(weight) <= 0}
        >
          Add Sale Log
        </button>
      </form>
    </div>
  );
}

export default SaleForm;
