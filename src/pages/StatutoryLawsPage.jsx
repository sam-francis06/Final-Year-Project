import React, { useState, useEffect } from 'react';
import {
  Shield,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import StatutoryLawsView from '../components/StatutoryLawsView';
import '../styles/dashboard.css';
import '../styles/statutory-laws.css';

export default function StatutoryLawsPage() {
  const [theme, setTheme] = useState('light');
  const [userName, setUserName] = useState('Citizen');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize theme and user state from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const storedName = localStorage.getItem('fullname') || localStorage.getItem('email');
    if (storedName) {
      setUserName(storedName.includes('@') ? storedName.split('@')[0] : storedName);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  return (
    <div className="console-app">
      {/* Top Application Header */}
      <header className="console-header">
        <div className="header-left-cluster">
          <button 
            type="button" 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <a href="/dashboard.html" className="header-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="brand-shield" aria-hidden="true">
              <Shield size={19} />
            </div>
            <span className="brand-title">
              CyberCouncil
              <span className="brand-badge">Client Console</span>
            </span>
          </a>
        </div>

        <nav className="header-nav" aria-label="Console Navigation">
          <a href="/dashboard.html" className="nav-item">Overview</a>
          <a href="/tool-dashboard.html" className="nav-item">Security Modules</a>
          <a href="/incident-logs.html" className="nav-item">Incident Logs</a>
          <a href="/user-cyber-laws.html" className="nav-item active">Statutory Laws</a>
        </nav>

        <div className="header-actions">
          <div className="system-status-indicator" title="Statutory Legal Database Active">
            <span className="indicator-dot" />
            <span className="status-indicator-text">IT Act Reference Active</span>
          </div>

          <button 
            type="button" 
            className="theme-btn" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <a href="/profile.html" className="user-badge" title="Account Details">
            <div className="user-avatar-circle">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <span className="user-name-text">{userName}</span>
          </a>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 'var(--header-height, 60px)',
            left: 0,
            right: 0,
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-default)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            zIndex: 999,
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <a href="/dashboard.html" className="nav-item" style={{ padding: '10px 14px' }}>Overview</a>
          <a href="/tool-dashboard.html" className="nav-item" style={{ padding: '10px 14px' }}>Security Modules</a>
          <a href="/incident-logs.html" className="nav-item" style={{ padding: '10px 14px' }}>Incident Logs</a>
          <a href="/user-cyber-laws.html" className="nav-item active" style={{ padding: '10px 14px' }}>Statutory Laws</a>
        </div>
      )}

      {/* Main Full-Width Dedicated Page Worksurface */}
      <main className="console-main sl-page-main">
        <StatutoryLawsView
          onBack={() => {
            window.location.href = '/tool-dashboard.html';
          }}
        />
      </main>
    </div>
  );
}
