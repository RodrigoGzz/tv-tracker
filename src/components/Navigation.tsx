import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const tabs = [
    { id: '/', label: 'Descubrir', icon: '🔍' },
    { id: '/my-shows', label: 'Mis Series', icon: '📺' },
    { id: '/search', label: 'Buscar', icon: '🔎' },
    { id: '/stats', label: 'Estadísticas', icon: '📊' },
    { id: '/settings', label: 'Configuración', icon: '⚙️' },
  ];

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <h1>📺 TV Tracker</h1>
          <p>Tu seguimiento de series personal</p>
        </Link>

        {/* Mobile menu button */}
        <button className="mobile-menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          ☰
        </button>

        {/* Navigation tabs */}
        <div className={`nav-tabs ${isMenuOpen ? 'mobile-open' : ''}`}>
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              to={tab.id}
              onClick={() => setIsMenuOpen(false)}
              className={`nav-tab ${location.pathname === tab.id ? 'active' : ''}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
