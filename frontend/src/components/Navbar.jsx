import React from 'react';
import { Plus, Server } from 'lucide-react';

export default function Navbar({ title, onOpenAddItem }) {
  return (
    <header className="top-navbar">
      <div className="top-title">{title}</div>
      <div className="top-actions">
        <div className="env-badge">
          <Server size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
          Campus EKS
        </div>
        <button className="btn btn-primary" onClick={onOpenAddItem}>
          <Plus size={16} />
          <span>New Asset</span>
        </button>
      </div>
    </header>
  );
}
