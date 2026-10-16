import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  return (
    <div className="toast-container">
      <div className={`toast ${type}`}>
        {type === 'success' ? (
          <CheckCircle2 size={18} color="var(--success)" />
        ) : (
          <AlertCircle size={18} color="var(--danger)" />
        )}
        <span style={{ flex: 1 }}>{message}</span>
        <button className="btn-icon" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
