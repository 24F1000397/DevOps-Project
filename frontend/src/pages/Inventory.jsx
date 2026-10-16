import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Edit2,
  Trash2,
  PackageX,
} from 'lucide-react';
import ItemModal from '../components/ItemModal';
import IssueReturnModal from '../components/IssueReturnModal';
import {
  getItems,
  getCategories,
  createItem,
  updateItem,
  deleteItem,
  issueItem,
  returnItem,
} from '../services/api';

export default function Inventory({ onNotify }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [isIssueReturnOpen, setIsIssueReturnOpen] = useState(false);
  const [activeItemForOperation, setActiveItemForOperation] = useState(null);
  const [operationMode, setOperationMode] = useState('issue'); // 'issue' | 'return'

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsData, catsData] = await Promise.all([
        getItems({
          search: search || undefined,
          category_id: selectedCategory || undefined,
          status: selectedStatus || undefined,
          low_stock: lowStockOnly,
        }),
        getCategories().catch(() => []),
      ]);
      setItems(itemsData || []);
      setCategories(catsData || []);
    } catch (err) {
      onNotify(err.message || 'Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedStatus, lowStockOnly]);

  const handleSaveItem = async (payload, itemId) => {
    if (itemId) {
      await updateItem(itemId, payload);
      onNotify('Asset updated successfully', 'success');
    } else {
      await createItem(payload);
      onNotify('New asset created successfully', 'success');
    }
    await loadData();
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete ${item.name} (${item.sku})?`)) {
      return;
    }
    try {
      await deleteItem(item.id);
      onNotify(`Deleted ${item.name}`, 'success');
      await loadData();
    } catch (err) {
      onNotify(err.message || 'Failed to delete item', 'error');
    }
  };

  const handleStockOperation = async ({ itemId, quantity, notes, mode }) => {
    if (mode === 'issue') {
      await issueItem(itemId, { quantity, notes });
      onNotify(`Successfully issued ${quantity} units`, 'success');
    } else {
      await returnItem(itemId, { quantity, notes });
      onNotify(`Successfully returned ${quantity} units`, 'success');
    }
    await loadData();
  };

  const openIssueModal = (item) => {
    setActiveItemForOperation(item);
    setOperationMode('issue');
    setIsIssueReturnOpen(true);
  };

  const openReturnModal = (item) => {
    setActiveItemForOperation(item);
    setOperationMode('return');
    setIsIssueReturnOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h2>Campus Inventory</h2>
          <p>Track hardware, classroom gear, and laboratory assets across all departments.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingItem(null);
            setIsItemModalOpen(true);
          }}
        >
          <Plus size={16} />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Toolbar / Search & Filter Bar */}
      <div className="toolbar-card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by asset name, SKU, or room location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Stock Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
            />
            <span>Low Stock Only</span>
          </label>
        </div>
      </div>

      {/* Inventory Listing */}
      {loading ? (
        <div className="state-container">
          <div className="spinner"></div>
          <p>Loading inventory...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="state-container">
          <div className="state-icon">
            <PackageX size={28} />
          </div>
          <div className="state-title">No assets found</div>
          <p>Try adjusting your search query or add a new equipment item to your catalog.</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingItem(null);
              setIsItemModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Create First Item</span>
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset Details</th>
                <th>Category</th>
                <th>Location</th>
                <th>Stock (Avail / Total)</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
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
                  <td>{item.location || '—'}</td>
                  <td>
                    <strong>{item.available_quantity}</strong> / {item.quantity}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Min alert: {item.minimum_stock}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${item.status.toLowerCase().replace(/_/g, '-')}`}>
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        title="Issue units to student/faculty"
                        onClick={() => openIssueModal(item)}
                        disabled={item.available_quantity <= 0}
                      >
                        <ArrowUpRight size={14} color="#f87171" />
                        <span>Issue</span>
                      </button>

                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        title="Return checked-out units"
                        onClick={() => openReturnModal(item)}
                        disabled={item.available_quantity >= item.quantity}
                      >
                        <ArrowDownLeft size={14} color="#34d399" />
                        <span>Return</span>
                      </button>

                      <button
                        className="btn-icon"
                        title="Edit asset details"
                        onClick={() => openEditModal(item)}
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        className="btn-icon delete"
                        title="Delete asset"
                        onClick={() => handleDeleteItem(item)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        item={editingItem}
        categories={categories}
      />

      <IssueReturnModal
        isOpen={isIssueReturnOpen}
        onClose={() => setIsIssueReturnOpen(false)}
        onConfirm={handleStockOperation}
        item={activeItemForOperation}
        mode={operationMode}
      />
    </div>
  );
}
