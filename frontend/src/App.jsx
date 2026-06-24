import React, { useState, useEffect } from 'react';
import { LayoutDashboard, History, Settings as SettingsIcon, AlertCircle, ShoppingCart } from 'lucide-react';
import DashboardStats from './components/DashboardStats';
import SaleForm from './components/SaleForm';
import SalesHistory from './components/SalesHistory';
import InventorySettings from './components/InventorySettings';

// Set active API Endpoint
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'history', 'settings'
  const [sales, setSales] = useState([]);
  const [settings, setSettings] = useState({
    priceRateWeight: 1.5,
    priceRateAmount: 100,
    currentStock: 500
  });
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalWeight: 0,
    totalPaid: 0,
    totalPending: 0,
    todayRevenue: 0,
    todayWeight: 0,
    salesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Show status popup
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, salesRes, analyticsRes] = await Promise.all([
        fetch(`${API_URL}/settings`),
        fetch(`${API_URL}/sales`),
        fetch(`${API_URL}/analytics`)
      ]);

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setSales(salesData);
      }
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setSummary(analyticsData.summary);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('⚠️ Could not connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Post new transaction
  const handleRecordSale = async (newSaleData) => {
    try {
      const res = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSaleData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to record sale');
      }

      const data = await res.json();

      // Update local states immediately
      setSales((prev) => [data.sale, ...prev]);
      setSettings(data.settings);
      showToast('🥭 Sale logged successfully!');

      // Refresh statistics
      const analyticsRes = await fetch(`${API_URL}/analytics`);
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setSummary(analyticsData.summary);
      }
    } catch (error) {
      showToast(`❌ Error: ${error.message}`);
    }
  };

  // Toggle paid/pending status
  const handleToggleStatus = async (saleId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/sales/${saleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update payment status');

      const data = await res.json();

      // Update lists
      setSales((prev) => prev.map((s) => (s._id === saleId ? data.sale : s)));
      showToast(`Status updated to ${newStatus}`);

      // Refresh statistics
      const analyticsRes = await fetch(`${API_URL}/analytics`);
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setSummary(analyticsData.summary);
      }
    } catch (error) {
      showToast(`❌ Error: ${error.message}`);
    }
  };

  // Delete transaction log
  const handleDeleteSale = async (saleId) => {
    try {
      const res = await fetch(`${API_URL}/sales/${saleId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete transaction log');

      const data = await res.json();

      setSales((prev) => prev.filter((s) => s._id !== saleId));
      setSettings(data.settings);
      showToast('Sale record removed');

      // Refresh statistics
      const analyticsRes = await fetch(`${API_URL}/analytics`);
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setSummary(analyticsData.summary);
      }
    } catch (error) {
      showToast(`❌ Error: ${error.message}`);
    }
  };

  // Save Pricing and Stock configurations
  const handleUpdateSettings = async (updatedSettings) => {
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });

      if (!res.ok) throw new Error('Failed to update shop configuration');

      const data = await res.json();
      setSettings(data);
      showToast('⚙️ Shop settings updated successfully');

      // Refresh statistics
      const analyticsRes = await fetch(`${API_URL}/analytics`);
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setSummary(analyticsData.summary);
      }
    } catch (error) {
      showToast(`❌ Error: ${error.message}`);
    }
  };

  // Clear all sales history
  const handleClearLogs = async () => {
    try {
      // Loop through all sales and delete them
      // Alternatively, backend could support a DELETE /api/sales route.
      // Let's call individual delete for safety, or we can just send request.
      // We will loop delete for now to leverage database transactions in mongoose.
      showToast('Clearing logs, please wait...');

      const deletePromises = sales.map(s =>
        fetch(`${API_URL}/sales/${s._id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);

      setSales([]);
      showToast('🧹 All sales logs cleared');
      fetchData();
    } catch (error) {
      showToast('❌ Error clearing logs');
    }
  };

  return (
    <div className="app-container">
      {/* Header Panel */}
      <header className="header">
        <div className="logo-container">
          <span className="logo-icon">🥭</span>
          <div>
            <h1 className="logo-title">MangoCounter</h1>
            <p style={{ fontSize: '0.75rem', fontWeight: '600' }}>POS & Tracker</p>
          </div>
        </div>

        {/* Desktop Navbar */}
        <nav className="nav-desktop">
          <button
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button
            className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={18} /> Sales Log
          </button>
          <button
            className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon size={18} /> Shop Settings
          </button>
        </nav>

        {/* Stock Badge */}
        <div className={`stock-badge ${settings.currentStock < 50 ? 'stock-warning' : ''}`}>
          Stock: <span className="stock-count">{settings.currentStock} kg</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ marginTop: '12px' }}>
        {/* KPI Widgets */}
        <DashboardStats
          summary={summary}
          settings={settings}
          loading={loading}
        />

        {/* Tab Router Rendering */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">
            <SaleForm
              settings={settings}
              onRecordSale={handleRecordSale}
            />
            <div className="card">
              <h3 className="card-title">
                <ShoppingCart size={20} style={{ color: 'var(--mango-accent)' }} />
                Today's Summary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Today's Revenue</span>
                  <span style={{ fontWeight: '800', color: 'var(--color-success)' }}>₹{summary.todayRevenue || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Today's Sold</span>
                  <span style={{ fontWeight: '800' }}>{summary.todayWeight || 0} kg</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Today's Orders</span>
                  <span style={{ fontWeight: '800' }}>{sales.filter(s => new Date(s.date) >= new Date().setHours(0, 0, 0, 0)).length} sales</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="dashboard-full-width">
            <SalesHistory
              sales={sales}
              onToggleStatus={handleToggleStatus}
              onDeleteSale={handleDeleteSale}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="dashboard-full-width">
            <InventorySettings
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onClearLogs={handleClearLogs}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="nav-mobile">
        <button
          className={`nav-mobile-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard className="nav-mobile-icon" />
          <span>Dashboard</span>
        </button>
        <button
          className={`nav-mobile-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History className="nav-mobile-icon" />
          <span>History Log</span>
        </button>
        <button
          className={`nav-mobile-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon className="nav-mobile-icon" />
          <span>Settings</span>
        </button>
      </nav>

      {/* Floating Status Notification (Toast) */}
      {toastMessage && (
        <div className="toast">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
