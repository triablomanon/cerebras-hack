import React from 'react';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div>
          <h1>
            <i className="fas fa-leaf"></i>
            EcoTrip Planner
          </h1>
          <div className="header-subtitle">
            Plan your perfect trip with minimal environmental impact
          </div>
        </div>
        <div className="eco-stats">
          <div className="eco-stat">
            <div className="eco-stat-value">CO₂</div>
            <div className="eco-stat-label">Tracker</div>
          </div>
          <div className="eco-stat">
            <div className="eco-stat-value">🌱</div>
            <div className="eco-stat-label">Eco-Friendly</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
