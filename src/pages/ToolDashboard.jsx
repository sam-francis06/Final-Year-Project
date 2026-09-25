import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  KeyRound,
  Wifi,
  Brain,
  FileWarning,
  EyeOff,
  Camera,
  Globe,
  Search,
  Moon,
  Sun,
  Activity,
  FileText,
  CheckCircle2,
  ExternalLink,
  Scale,
  Cpu,
  Layers,
  Terminal,
  Menu,
  X
} from 'lucide-react';
import { TOOL_CATEGORIES, TOOLS_DATA } from '../data/toolsData';

// Map icon string names to Lucide icon components
const ICON_MAP = {
  ShieldAlert,
  KeyRound,
  Wifi,
  Brain,
  FileWarning,
  EyeOff,
  Camera,
  Globe
};

export default function ToolDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [theme, setTheme] = useState('light');
  const [reportCount, setReportCount] = useState(0);
  const [userName, setUserName] = useState('Citizen');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize theme and user state from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const storedName = localStorage.getItem('fullname') || localStorage.getItem('email');
    if (storedName) {
      setUserName(storedName.includes('@') ? storedName.split('@')[0] : storedName);
    }

    try {
      const reports = JSON.parse(localStorage.getItem('cyberReports') || '[]');
      setReportCount(reports.length);
    } catch (e) {
      console.warn('Failed to parse cyberReports:', e);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  // Close sidebar on window resize if transitioned to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  // Filter tools
  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return TOOLS_DATA.filter(tool => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const matchesQuery = !query || 
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.capabilities.some(c => c.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="console-app">
      {/* Top Application Header */}
      <header className="console-header">
        <div className="header-left-cluster">
          <button 
            type="button" 
            className="mobile-menu-btn" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isSidebarOpen}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="header-brand">
            <div className="brand-shield" aria-hidden="true">
              <Shield size={19} />
            </div>
            <span className="brand-title">
              CyberCouncil
              <span className="brand-badge">Client Console</span>
            </span>
          </div>
        </div>

        <nav className="header-nav" aria-label="Console Navigation">
          <a href="/dashboard.html" className="nav-item">Overview</a>
          <a href="/tool-dashboard.html" className="nav-item active">Security Modules</a>
          <a href="/reports.html" className="nav-item">Incident Logs</a>
          <a href="/user-cyber-laws.html" className="nav-item">Statutory Laws</a>
        </nav>

        <div className="header-actions">
          <div className="system-status-indicator" title="All local defensive modules active">
            <span className="indicator-dot" />
            <span className="status-indicator-text">Modules Online</span>
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

      {/* Main Console Body */}
      <div className="console-body">
        {/* Dimmer backdrop for mobile drawer */}
        <div 
          className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`} 
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* Enterprise Sidebar / Mobile Drawer */}
        <aside className={`console-sidebar ${isSidebarOpen ? 'open' : ''}`} aria-label="Module Sidebar">
          {/* Mobile Drawer Header with Close Button */}
          <div className="sidebar-drawer-header">
            <div className="drawer-brand">
              <div className="brand-shield" aria-hidden="true">
                <Shield size={18} />
              </div>
              <span className="brand-title">CyberCouncil</span>
            </div>
            <button 
              type="button" 
              className="drawer-close-btn" 
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close navigation drawer"
            >
              <X size={19} />
            </button>
          </div>

          {/* Quick Nav Links on Mobile Drawer */}
          <div className="mobile-nav-section">
            <div className="sidebar-label">Navigation</div>
            <ul className="sidebar-menu">
              <li>
                <a href="/dashboard.html" className="sidebar-link">
                  <span className="sidebar-link-content">
                    <Activity size={18} />
                    <span>Overview</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="/tool-dashboard.html" className="sidebar-link active">
                  <span className="sidebar-link-content">
                    <Layers size={18} />
                    <span>Security Modules</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="/reports.html" className="sidebar-link">
                  <span className="sidebar-link-content">
                    <FileText size={18} />
                    <span>Incident Logs</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="/user-cyber-laws.html" className="sidebar-link">
                  <span className="sidebar-link-content">
                    <Scale size={18} />
                    <span>Statutory Laws</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="sidebar-label">Operations</div>
            <ul className="sidebar-menu">
              <li>
                <a href="/dashboard.html" className="sidebar-link">
                  <span className="sidebar-link-content">
                    <Activity size={18} />
                    <span>System Status</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="/tool-dashboard.html" className="sidebar-link active">
                  <span className="sidebar-link-content">
                    <Layers size={18} />
                    <span>Security Modules</span>
                  </span>
                  <span className="sidebar-count-badge">8</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="sidebar-label">Threat Inspection</div>
            <ul className="sidebar-menu">
              <li>
                <a href="/phishing-detection.html" className="sidebar-link">
                  <span className="sidebar-link-content">
                    <ShieldAlert size={18} />
                    <span>Phishing Scanner</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="/password-checker.html" className="sidebar-link">
                  <span className="sidebar-link-content">
                    <KeyRound size={18} />
                    <span>Password Auditor</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="/wifi-security.html" className="sidebar-link">
                  <span className="sidebar-link-content">
                    <Wifi size={18} />
                    <span>Network Inspector</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="/social-engineering.html" className="sidebar-link">
                  <span className="sidebar-link-content">
                    <Brain size={18} />
                    <span>Social Engineering</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="sidebar-label">Digital Forensics</div>
            <ul className="sidebar-menu">
              <li>
                <a href="/malware.html" className="sidebar-link">
                  <span className="sidebar-link-content">
                    <FileWarning size={18} />
                    <span>Payload Scanner</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="/privacy-analyzer.html" className="sidebar-link">
                  <span className="sidebar-link-content">
                    <EyeOff size={18} />
                    <span>Privacy Auditor</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="/image-metadata.html" className="sidebar-link">
                  <span className="sidebar-link-content">
                    <Camera size={18} />
                    <span>EXIF Extractor</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="/user-ip-display.html" className="sidebar-link">
                  <span className="sidebar-link-content">
                    <Globe size={18} />
                    <span>IP Geolocation</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <div className="sidebar-label">Assistance & Legal</div>
            <ul className="sidebar-menu">
              <li>
                <a href="/user-cyber-laws.html" className="sidebar-link">
                  <span className="sidebar-link-content">
                    <Scale size={18} />
                    <span>IT Act Sections</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="/reports.html" className="sidebar-link">
                  <span className="sidebar-link-content">
                    <FileText size={18} />
                    <span>Incident Reports</span>
                  </span>
                  {reportCount > 0 && (
                    <span className="sidebar-count-badge">{reportCount}</span>
                  )}
                </a>
              </li>
            </ul>
          </div>
        </aside>

        {/* Center Main Worksurface */}
        <main className="console-main">
          {/* Section Heading & Contextual Actions */}
          <div className="console-title-row">
            <div className="title-meta">
              <h1>Individual Security Console</h1>
              <p>Execute client-side threat detection, evaluate privacy risks, inspect network parameters, and perform forensic audits.</p>
            </div>
            <div className="action-row">
              <a href="/user-cyber-laws.html" className="btn-secondary">
                <Scale size={16} />
                <span>Statutory Reference</span>
              </a>
              <a href="/reports.html" className="btn-primary">
                <FileText size={16} />
                <span>File Incident Report</span>
              </a>
            </div>
          </div>

          {/* Telemetry Strip */}
          <div className="telemetry-strip" aria-label="System Telemetry">
            <div className="telemetry-card">
              <div className="telemetry-info">
                <span className="telemetry-label">Active Modules</span>
                <span className="telemetry-metric">8 of 8</span>
                <span className="telemetry-subtext">Client sandboxed</span>
              </div>
              <div className="telemetry-icon-box">
                <Layers size={22} />
              </div>
            </div>

            <div className="telemetry-card">
              <div className="telemetry-info">
                <span className="telemetry-label">System Posture</span>
                <span className="telemetry-metric" style={{ color: 'var(--status-green)' }}>Verified</span>
                <span className="telemetry-subtext">No open exposures</span>
              </div>
              <div className="telemetry-icon-box">
                <CheckCircle2 size={22} style={{ color: 'var(--status-green)' }} />
              </div>
            </div>

            <div className="telemetry-card">
              <div className="telemetry-info">
                <span className="telemetry-label">Incident Reports</span>
                <span className="telemetry-metric">{reportCount}</span>
                <span className="telemetry-subtext">Saved in local record</span>
              </div>
              <div className="telemetry-icon-box">
                <FileText size={22} />
              </div>
            </div>

            <div className="telemetry-card">
              <div className="telemetry-info">
                <span className="telemetry-label">Execution Environment</span>
                <span className="telemetry-metric">React 19 / Vite</span>
                <span className="telemetry-subtext">Zero external leaks</span>
              </div>
              <div className="telemetry-icon-box">
                <Terminal size={22} />
              </div>
            </div>
          </div>

          {/* Toolbar: Search & Category Tabs */}
          <div className="toolbar-container">
            <div className="toolbar-top-row">
              <div className="search-box-wrapper">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Filter security modules by name, keyword, or capabilities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="toolbar-stats">
                Showing <strong>{filteredTools.length}</strong> of {TOOLS_DATA.length} modules
              </div>
            </div>

            <div className="filter-tabs" role="tablist">
              {TOOL_CATEGORIES.map(category => (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === category.id}
                  className={`filter-tab ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tools Grid */}
          <div className="tools-grid">
            {filteredTools.map(tool => {
              const IconComponent = ICON_MAP[tool.icon] || Shield;
              return (
                <article key={tool.id} className="tool-card">
                  <div className="card-top">
                    <div className="card-header-row">
                      <div className="tool-icon-wrapper" aria-hidden="true">
                        <IconComponent size={22} />
                      </div>
                      <span className="tool-status-badge">
                        <span className="status-badge-dot" />
                        <span>{tool.status}</span>
                      </span>
                    </div>

                    <h2 className="tool-name">{tool.name}</h2>
                    <p className="tool-description">{tool.description}</p>

                    <div className="capabilities-list" aria-label="Capabilities">
                      {tool.capabilities.map((cap, i) => (
                        <span key={i} className="capability-pill">{cap}</span>
                      ))}
                    </div>
                  </div>

                  <div className="card-footer">
                    <span className="execution-type">
                      <Cpu size={14} />
                      <span>{tool.executionType}</span>
                    </span>

                    <a href={tool.path} className="open-tool-btn">
                      <span>Launch Module</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </article>
              );
            })}

            {filteredTools.length === 0 && (
              <div className="empty-state">
                <Search size={34} style={{ color: 'var(--text-tertiary)', margin: '0 auto' }} />
                <h3>No security modules match your filter</h3>
                <p>Try modifying your search criteria or reset category filters.</p>
              </div>
            )}
          </div>

          {/* Statutory Complaint Escalation Strip */}
          <section className="incident-banner">
            <div className="incident-banner-text">
              <h4>Encountered a cybercrime, financial fraud, or unauthorized compromise?</h4>
              <p>Submit a formal digital complaint with structured evidence under provisions of the Indian IT Act.</p>
            </div>
            <div className="incident-banner-actions">
              <a href="/reports.html" className="btn-primary">
                File Incident Report
              </a>
              <a href="/user-cyber-laws.html" className="btn-secondary">
                View Penal Sections
              </a>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
