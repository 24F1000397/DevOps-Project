import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Boxes,
  Tags,
  History,
  Activity,
  Layers,
} from 'lucide-react';
import { getHealth } from '../services/api';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const [healthy, setHealthy] = useState(false);

  useEffect(() => {
    getHealth()
      .then((data) => setHealthy(data?.status === 'healthy'))
      .catch(() => setHealthy(false));
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'transactions', label: 'Transactions', icon: History },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/logo.svg" alt="CampusStock Logo" className="brand-logo" />
        <div className="brand-info">
          <h1>CampusStock</h1>
          <span>Asset Management</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="status-indicator">
          <span
            className="status-dot"
            style={{
              backgroundColor: healthy ? 'var(--success)' : 'var(--danger)',
              boxShadow: healthy ? '0 0 8px var(--success)' : '0 0 8px var(--danger)',
            }}
          />
          <span>{healthy ? 'API Connected' : 'API Standby'}</span>
        </div>
        <span>v1.0.0 Enterprise</span>
      </div>
    </aside>
  );
}
