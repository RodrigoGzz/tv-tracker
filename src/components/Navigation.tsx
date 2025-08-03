import React, { useState } from 'react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { id: 'discover', label: 'Descubrir', icon: '🔍' },
    { id: 'my-shows', label: 'Mis Series', icon: '📺' },
    { id: 'search', label: 'Buscar', icon: '🔎' }
  ];

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h1>📺 TV Tracker</h1>
          <p>Tu seguimiento de series personal</p>
        </div>

        {/* Mobile menu button */}
        <button 
          className="mobile-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>

        {/* Navigation tabs */}
        <div className={`nav-tabs ${isMenuOpen ? 'mobile-open' : ''}`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                setIsMenuOpen(false);
              }}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
