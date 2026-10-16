import React, { useEffect, useState } from 'react';
import { History, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { getTransactions } from '../services/api';

export default function Transactions({ onNotify }) {
  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await getTransactions({
        transaction_type: typeFilter || undefined,
        limit: 100,
      });
      setTransactions(data || []);
    } catch (err) {
      onNotify(err.message || 'Failed to load transaction history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [typeFilter]);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h2>Stock Movement Audit Log</h2>
          <p>Chronological history of all campus item checkout (issue) and return transactions.</p>
        </div>
      </div>

      <div className="toolbar-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter Activity:</span>
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Stock Movements</option>
            <option value="ISSUE">Issue Operations Only</option>
            <option value="RETURN">Return Operations Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="state-container">
          <div className="spinner"></div>
          <p>Loading audit logs...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="state-container">
          <div className="state-icon">
            <History size={28} />
          </div>
          <div className="state-title">No transactions recorded yet</div>
          <p>When assets are checked out or returned via the inventory screen, audit records appear here.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operation</th>
                <th>Asset Name & SKU</th>
                <th>Units Moved</th>
                <th>Notes / Recipient</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => {
                const isIssue = t.transaction_type === 'ISSUE';
                return (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock size={14} color="var(--text-muted)" />
                        <span>{new Date(t.created_at).toLocaleString()}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${t.transaction_type.toLowerCase()}`}>
                        {isIssue ? <ArrowUpRight size={12} style={{ marginRight: 4 }} /> : <ArrowDownLeft size={12} style={{ marginRight: 4 }} />}
                        {t.transaction_type}
                      </span>
                    </td>
                    <td>
                      <div className="item-title">{t.item_name || `Asset #${t.item_id}`}</div>
                      {t.item_sku && <div className="item-sku">{t.item_sku}</div>}
                    </td>
                    <td>
                      <strong style={{ color: isIssue ? 'var(--danger)' : 'var(--success)' }}>
                        {isIssue ? `-${t.quantity}` : `+${t.quantity}`} units
                      </strong>
                    </td>
                    <td>{t.notes || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
