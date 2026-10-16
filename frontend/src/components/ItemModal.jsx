import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ItemModal({ isOpen, onClose, onSave, item, categories = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '',
    quantity: 1,
    available_quantity: 1,
    minimum_stock: 5,
    location: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        sku: item.sku || '',
        category_id: item.category_id || '',
        quantity: item.quantity ?? 1,
        available_quantity: item.available_quantity ?? 1,
        minimum_stock: item.minimum_stock ?? 5,
        location: item.location || '',
        description: item.description || '',
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        quantity: 10,
        available_quantity: 10,
        minimum_stock: 3,
        location: 'CS Lab 301',
        description: '',
      });
    }
    setError('');
  }, [item, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Item name is required');
      return;
    }
    if (!formData.sku.trim()) {
      setError('SKU is required');
      return;
    }
    if (Number(formData.available_quantity) > Number(formData.quantity)) {
      setError('Available quantity cannot exceed total quantity');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        category_id: formData.category_id ? Number(formData.category_id) : null,
        quantity: Number(formData.quantity),
        available_quantity: Number(formData.available_quantity),
        minimum_stock: Number(formData.minimum_stock),
        location: formData.location.trim() || null,
        description: formData.description.trim() || null,
      };

      await onSave(payload, item?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{item ? 'Edit Inventory Item' : 'Add New Campus Asset'}</h3>
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

            <div className="form-group">
              <label>Asset Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Dell Latitude 5420 Laptop"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>SKU / Serial Code *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. LAP-DELL-001"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  className="form-control"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Total Quantity *</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={formData.quantity}
                  onChange={(e) => {
                    const q = e.target.value;
                    setFormData({
                      ...formData,
                      quantity: q,
                      available_quantity: item ? formData.available_quantity : q,
                    });
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Available Quantity *</label>
                <input
                  type="number"
                  min="0"
                  max={formData.quantity}
                  className="form-control"
                  value={formData.available_quantity}
                  onChange={(e) => setFormData({ ...formData, available_quantity: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Low Stock Alert Threshold</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={formData.minimum_stock}
                  onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Location / Room</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. IT Helpdesk / Room 204"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description & Notes</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Hardware specifications, warranty info, or campus allocation notes"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : item ? 'Update Asset' : 'Create Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
