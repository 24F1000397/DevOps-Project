import React, { useEffect, useState } from 'react';
import { Plus, Tags, Trash2 } from 'lucide-react';
import CategoryModal from '../components/CategoryModal';
import { getCategories, createCategory, deleteCategory } from '../services/api';

export default function Categories({ onNotify }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (err) {
      onNotify(err.message || 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (payload) => {
    await createCategory(payload);
    onNotify('Category created successfully', 'success');
    await loadCategories();
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? Items in this category will become Uncategorized.`)) {
      return;
    }
    try {
      await deleteCategory(cat.id);
      onNotify(`Deleted category "${cat.name}"`, 'success');
      await loadCategories();
    } catch (err) {
      onNotify(err.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h2>Asset Categories</h2>
          <p>Organize equipment by departments, lab facilities, and hardware groups.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>New Category</span>
        </button>
      </div>

      {loading ? (
        <div className="state-container">
          <div className="spinner"></div>
          <p>Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="state-container">
          <div className="state-icon">
            <Tags size={28} />
          </div>
          <div className="state-title">No categories yet</div>
          <p>Create categories like Laptops, Lab Oscilloscopes, Projectors to group your campus stock.</p>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Create Category</span>
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Description</th>
                <th>Created Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ background: 'var(--primary-light)', color: '#818cf8', padding: 8, borderRadius: 'var(--radius-sm)' }}>
                        <Tags size={16} />
                      </div>
                      <strong style={{ color: 'var(--text-primary)' }}>{cat.name}</strong>
                    </div>
                  </td>
                  <td>{cat.description || '—'}</td>
                  <td>{new Date(cat.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="btn-icon delete"
                        title="Delete category"
                        onClick={() => handleDelete(cat)}
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

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreate}
      />
    </div>
  );
}
