import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Categories from './pages/Categories';
import Transactions from './pages/Transactions';
import ItemModal from './components/ItemModal';
import { createItem, getCategories } from './services/api';

import './styles/index.css';
import './styles/App.css';
import './styles/components.css';
import './styles/pages.css';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: 'success' });
    }, 4000);
  };

  const handleOpenQuickAdd = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats || []);
    } catch {
      setCategories([]);
    }
    setQuickAddOpen(true);
  };

  const handleQuickAddSave = async (payload) => {
    await createItem(payload);
    notify('New asset created successfully', 'success');
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'CampusStock Dashboard';
      case 'inventory':
        return 'Inventory & Asset Tracking';
      case 'categories':
        return 'Asset Category Directory';
      case 'transactions':
        return 'Stock Circulation & Audit Log';
      default:
        return 'CampusStock';
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <div className="main-wrapper">
        <Navbar title={getPageTitle()} onOpenAddItem={handleOpenQuickAdd} />

        <main className="content-container">
          {currentTab === 'dashboard' && (
            <Dashboard onNavigateToInventory={() => setCurrentTab('inventory')} />
          )}
          {currentTab === 'inventory' && <Inventory onNotify={notify} />}
          {currentTab === 'categories' && <Categories onNotify={notify} />}
          {currentTab === 'transactions' && <Transactions onNotify={notify} />}
        </main>
      </div>

      <ItemModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSave={handleQuickAddSave}
        categories={categories}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}
