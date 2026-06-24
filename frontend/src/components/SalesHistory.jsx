import React, { useState } from 'react';
import { Search, CheckCircle, Clock, Trash2, Calendar } from 'lucide-react';

function SalesHistory({ sales, onToggleStatus, onDeleteSale }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter sales based on search term and selected status
  const filteredSales = sales.filter((sale) => {
    const matchesSearch = sale.buyerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    const options = { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <div className="card">
      <h3 className="card-title">
        <Calendar size={22} style={{ color: 'var(--mango-primary)' }} />
        Sales Log History
      </h3>

      {/* Search & Filter Row */}
      <div className="search-filter-row">
        <div className="search-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }}>
            <Search size={18} />
          </span>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '44px' }}
            placeholder="Search by buyer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-select-wrapper">
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%237c6d60\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '16px' }}
          >
            <option value="All">All Payments</option>
            <option value="Paid">Paid Only</option>
            <option value="Pending">Pending Only</option>
          </select>
        </div>
      </div>

      {filteredSales.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🥭</div>
          <p className="empty-state-text">No transactions found</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Try adjusting your search or add a sale above.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="table-container">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Buyer Name</th>
                  <th>Weight</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                  <th>Date & Time</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale._id}>
                    <td style={{ fontWeight: '700' }}>{sale.buyerName}</td>
                    <td>{sale.weight} kg</td>
                    <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>₹{sale.totalAmount}</td>
                    <td>
                      <span className={`badge ${sale.status === 'Paid' ? 'badge-paid' : 'badge-pending'}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(sale.date)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className={`action-btn ${sale.status === 'Paid' ? 'action-btn-paid' : 'action-btn-pending'}`}
                          title={sale.status === 'Paid' ? 'Mark as Pending' : 'Mark as Paid'}
                          onClick={() => onToggleStatus(sale._id, sale.status === 'Paid' ? 'Pending' : 'Paid')}
                        >
                          {sale.status === 'Paid' ? <CheckCircle size={18} /> : <Clock size={18} />}
                        </button>
                        <button
                          className="action-btn action-btn-delete"
                          title="Delete sale log"
                          onClick={() => onDeleteSale(sale._id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="mobile-sales-list">
            {filteredSales.map((sale) => (
              <div key={sale._id} className="sales-card-mobile">
                <div className="mobile-card-header">
                  <span className="mobile-card-buyer">{sale.buyerName}</span>
                  <span className={`badge ${sale.status === 'Paid' ? 'badge-paid' : 'badge-pending'}`}>
                    {sale.status}
                  </span>
                </div>
                <div className="mobile-card-details">
                  <div>
                    <span className="detail-label">Quantity</span>
                    <div className="detail-val">{sale.weight} kg</div>
                  </div>
                  <div>
                    <span className="detail-label">Total Price</span>
                    <div className="detail-val" style={{ color: 'var(--mango-primary-hover)', fontWeight: '800' }}>
                      ₹{sale.totalAmount}
                    </div>
                  </div>
                  <div style={{ gridColumn: 'span 2', marginTop: '4px' }}>
                    <span className="detail-label">Recorded At</span>
                    <div className="detail-val" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {formatDate(sale.date)}
                    </div>
                  </div>
                </div>
                <div className="mobile-card-actions">
                  <button
                    className={`btn-secondary`}
                    style={{ padding: '8px 16px', fontSize: '0.85rem', flex: '1' }}
                    onClick={() => onToggleStatus(sale._id, sale.status === 'Paid' ? 'Pending' : 'Paid')}
                  >
                    {sale.status === 'Paid' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> Set Pending
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)' }}>
                        <CheckCircle size={14} /> Mark Paid
                      </span>
                    )}
                  </button>
                  <button
                    className="btn-danger"
                    style={{ padding: '8px', flex: '0 0 auto' }}
                    onClick={() => onDeleteSale(sale._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default SalesHistory;
