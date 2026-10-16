import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function IssueReturnModal({ isOpen, onClose, onConfirm, item, mode = 'issue' }) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isIssue = mode === 'issue';
  const maxAllowed = isIssue
    ? (item?.available_quantity || 0)
    : ((item?.quantity || 0) - (item?.available_quantity || 0));

  useEffect(() => {
    setQuantity(1);
    setNotes('');
    setError('');
  }, [isOpen, item, mode]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const qty = Number(quantity);
    if (qty <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }
    if (qty > maxAllowed) {
      setError(
        isIssue
          ? `Cannot issue ${qty} units. Only ${maxAllowed} available in stock.`
          : `Cannot return ${qty} units. At most ${maxAllowed} units are currently issued.`
      );
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm({
        itemId: item.id,
        quantity: qty,
        notes: notes.trim() || undefined,
        mode,
      });
      onClose();
    } catch (err) {
      setError(err.message || `Failed to ${mode} item`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isIssue ? (
              <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: 6, borderRadius: 'var(--radius-sm)' }}>
                <ArrowUpRight size={18} />
              </div>
            ) : (
              <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: 6, borderRadius: 'var(--radius-sm)' }}>
                <ArrowDownLeft size={18} />
              </div>
            )}
            <h3>{isIssue ? `Issue Asset Units` : `Return Asset Units`}</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.85rem', background: 'var(--danger-bg)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                {error}
              </div>
            )}

            <div style={{ background: 'var(--bg-muted)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{item.name}</div>
              <div style={{ color: 'var(--text-muted)', display: 'flex', gap: 16 }}>
                <span>SKU: <strong style={{ color: '#818cf8' }}>{item.sku}</strong></span>
                <span>Available: <strong style={{ color: 'var(--success)' }}>{item.available_quantity}</strong> / {item.quantity}</span>
              </div>
            </div>

            <div className="form-group">
              <label>
                Quantity to {isIssue ? 'Issue' : 'Return'} (Max: {maxAllowed}) *
              </label>
              <input
                type="number"
                min="1"
                max={maxAllowed}
                className="form-control"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                disabled={maxAllowed <= 0}
              />
              {maxAllowed <= 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>
                  {isIssue ? 'No stock available for issue.' : 'All units already accounted for in stock.'}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>{isIssue ? 'Issued To / Student ID / Dept' : 'Return Remarks / Condition'}</label>
              <input
                type="text"
                className="form-control"
                placeholder={isIssue ? 'e.g. CS-2024-041 (Saksham Gupta) or Robotics Lab' : 'e.g. Returned after seminar in good condition'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${isIssue ? 'btn-primary' : 'btn-primary'}`}
              disabled={submitting || maxAllowed <= 0}
            >
              {submitting ? 'Processing...' : isIssue ? 'Confirm Issue' : 'Confirm Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
