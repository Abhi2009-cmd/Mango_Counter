import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';

function InventorySettings({ settings, onUpdateSettings, onClearLogs }) {
  const [weightRate, setWeightRate] = useState(1.5);
  const [amountRate, setAmountRate] = useState(100);
  const [stock, setStock] = useState(500);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with settings props when they load
  useEffect(() => {
    if (settings) {
      if (settings.priceRateWeight !== undefined) setWeightRate(settings.priceRateWeight);
      if (settings.priceRateAmount !== undefined) setAmountRate(settings.priceRateAmount);
      if (settings.currentStock !== undefined) setStock(settings.currentStock);
    }
  }, [settings]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onUpdateSettings({
      priceRateWeight: Number(weightRate),
      priceRateAmount: Number(amountRate),
      currentStock: Number(stock)
    });
    setIsSaving(false);
  };

  const handleClearAll = () => {
    if (window.confirm('⚠️ WARNING: Are you sure you want to delete ALL sales logs? This action is permanent and cannot be undone.')) {
      onClearLogs();
    }
  };

  const currentRatePerKg = amountRate / weightRate;

  return (
    <div className="card">
      <h3 className="card-title">
        <Settings size={22} style={{ color: 'var(--text-muted)' }} />
        Shop Management Settings
      </h3>

      <form onSubmit={handleSaveSettings}>
        <h4 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-main)' }}>
          🥭 Pricing Configuration
        </h4>
        <p className="settings-description">
          Set how much your mangoes cost. The default rate is 1.5 kg for 100 Rs. You can change this below.
        </p>

        <div className="settings-grid">
          {/* Price Rate Weight */}
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label className="form-label">Weight Quantity</label>
            <div className="input-wrapper">
              <input
                type="number"
                step="0.1"
                min="0.1"
                className="form-input"
                value={weightRate}
                onChange={(e) => setWeightRate(e.target.value)}
                required
              />
              <span className="input-addon">kg</span>
            </div>
          </div>

          {/* Price Rate Amount */}
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label className="form-label">Calculated Price</label>
            <div className="input-wrapper">
              <input
                type="number"
                step="1"
                min="1"
                className="form-input"
                value={amountRate}
                onChange={(e) => setAmountRate(e.target.value)}
                required
              />
              <span className="input-addon">Rs</span>
            </div>
          </div>
        </div>

        {/* Calculated Info Display */}
        <div 
          style={{ 
            background: 'var(--bg-hover)', 
            border: '1px solid var(--border)', 
            padding: '12px 16px', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '24px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          Effective Pricing: <span style={{ color: 'var(--mango-primary-hover)' }}>₹{currentRatePerKg.toFixed(2)} per kg</span>
        </div>

        <h4 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-main)', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          📦 Inventory stock
        </h4>
        <p className="settings-description">
          Manage the active stock of mangoes in your shop. Sales will automatically deduct from this stock.
        </p>

        {/* Stock Level */}
        <div className="form-group" style={{ maxWidth: '300px' }}>
          <label className="form-label">Remaining Stock</label>
          <div className="input-wrapper">
            <input
              type="number"
              step="0.1"
              min="0"
              className="form-input"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
            <span className="input-addon">kg</span>
          </div>
        </div>

        {/* Save button */}
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isSaving}
          style={{ marginTop: '10px' }}
        >
          <RefreshCw size={18} className={isSaving ? 'spin' : ''} />
          {isSaving ? 'Updating...' : 'Save Configurations'}
        </button>
      </form>

      {/* Danger Zone */}
      <div 
        style={{ 
          marginTop: '32px', 
          borderTop: '2px dashed var(--color-warning)', 
          paddingTop: '20px' 
        }}
      >
        <h4 style={{ fontSize: '1rem', marginBottom: '8px', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} /> Danger Zone
        </h4>
        <p className="settings-description" style={{ color: 'var(--color-warning)' }}>
          Resetting data will delete all recorded sales logs permanently.
        </p>
        <button 
          type="button" 
          className="btn-danger" 
          onClick={handleClearAll}
        >
          Clear All Sales History
        </button>
      </div>
    </div>
  );
}

export default InventorySettings;
