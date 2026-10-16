import React from 'react';

export default function StatCard({ title, value, icon: Icon, color, accent }) {
  return (
    <div className="stat-card" style={{ '--card-accent': accent || color }}>
      <div className="stat-info">
        <span>{title}</span>
        <div className="stat-number">{value ?? 0}</div>
      </div>
      <div
        className="stat-icon"
        style={{
          backgroundColor: `rgba(${color}, 0.15)`,
          color: `rgb(${color})`,
        }}
      >
        <Icon size={24} />
      </div>
    </div>
  );
}
