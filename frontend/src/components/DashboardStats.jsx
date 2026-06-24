import React from 'react';
import { IndianRupee, Weight, Package, AlertCircle } from 'lucide-react';

function DashboardStats({ summary, settings, loading }) {
  const stats = [
    {
      title: 'Total Revenue',
      value: loading ? '...' : `₹${summary.totalRevenue || 0}`,
      label: 'All time sales value',
      icon: IndianRupee,
      className: 'revenue',
    },
    {
      title: 'Mangoes Sold',
      value: loading ? '...' : `${summary.totalWeight || 0} kg`,
      label: 'Total weight tracked',
      icon: Weight,
      className: 'weight',
    },
    {
      title: 'Available Stock',
      value: loading ? '...' : `${settings.currentStock || 0} kg`,
      label: 'Inventory remaining',
      icon: Package,
      className: 'stock',
      warning: (settings.currentStock || 0) < 50, // Highlight if stock is low
    },
    {
      title: 'Unpaid / Pending',
      value: loading ? '...' : `₹${summary.totalPending || 0}`,
      label: 'Payment to be collected',
      icon: AlertCircle,
      className: 'pending',
    },
  ];

  return (
    <div className="stats-container">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isLowStock = stat.className === 'stock' && stat.warning;
        return (
          <div 
            key={index} 
            className={`stat-card ${stat.className} ${isLowStock ? 'stock-warning' : ''}`}
          >
            <span className="stat-label">{stat.title}</span>
            <span className="stat-value">{stat.value}</span>
            <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              {isLowStock ? 'Low Stock Warning!' : stat.label}
            </p>
            <div className="stat-icon-wrapper">
              <Icon size={40} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DashboardStats;
