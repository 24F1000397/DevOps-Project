import React, { useEffect, useState } from 'react';
import {
  Boxes,
  CheckCircle2,
  ArrowUpRight,
  AlertTriangle,
  Layers,
  Clock,
  ArrowRight,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { getStats, getItems, getTransactions } from '../services/api';

export default function Dashboard({ onNavigateToInventory }) {
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [statsData, itemsData, txnsData] = await Promise.all([
          getStats().catch(() => null),
          getItems({ limit: 5 }).catch(() => []),
          getTransactions({ limit: 5 }).catch(() => []),
        ]);
        setStats(statsData);
        setRecentItems(itemsData || []);
        setRecentTxns(txnsData || []);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="state-container">
        <div className="spinner"></div>
        <p>Loading inventory metrics...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h2>Campus Asset Overview</h2>
          <p>Real-time campus equipment availability, checkout metrics, and health.</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Registered Models"
          value={stats?.total_items ?? 0}
          icon={Boxes}
          color="79, 70, 229"
          accent="#6366f1"
        />
        <StatCard
          title="Available In Stock"
          value={stats?.available_stock ?? 0}
          icon={CheckCircle2}
          color="16, 185, 129"
          accent="#10b981"
        />
        <StatCard
          title="Currently Checked Out"
          value={stats?.issued_items ?? 0}
          icon={ArrowUpRight}
          color="245, 158, 11"
          accent="#f59e0b"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.low_stock_items ?? 0}
          icon={AlertTriangle}
          color="239, 68, 68"
          accent="#ef4444"
        />
      </div>

      {/* Grid: Recent Assets + Audit Log */}
      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Recent Inventory Assets</h3>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={onNavigateToInventory}>
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {recentItems.length === 0 ? (
            <div className="state-container" style={{ padding: '30px 0' }}>
              <p>No inventory items registered yet.</p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Available / Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="item-title">{item.name}</div>
                        <div className="item-sku">{item.sku}</div>
                      </td>
                      <td>
                        <span className="badge badge-category">
                          {item.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td>
                        <strong>{item.available_quantity}</strong> / {item.quantity}
                      </td>
                      <td>
                        <span className={`badge badge-${item.status.toLowerCase().replace(/_/g, '-')}`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Recent Activity</h3>
            <Clock size={16} color="var(--text-muted)" />
          </div>

          {recentTxns.length === 0 ? (
            <div className="state-container" style={{ padding: '30px 0' }}>
              <p>No recent checkout activity.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentTxns.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: 'var(--bg-muted)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {t.item_name || `Item #${t.item_id}`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t.notes || (t.transaction_type === 'ISSUE' ? 'Issued to campus staff/student' : 'Returned to lab inventory')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge badge-${t.transaction_type.toLowerCase()}`}>
                      {t.transaction_type} {t.quantity}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
