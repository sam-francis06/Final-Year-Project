import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  KeyRound,
  FileWarning,
  FileText,
  Scale,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Edit3,
  Save,
  X,
  Sun,
  Moon,
  Menu,
  Bell,
  Lock,
  EyeOff,
  Clock,
  HelpCircle,
  LogOut
} from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/profile.css';

export default function ProfilePage() {
  const [theme, setTheme] = useState('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [modalType, setModalType] = useState(null); // 'password' | 'logout' | 'notifications' | 'privacy' | null

  const handleConfirmLogout = () => {
    try {
      localStorage.removeItem('fullname');
      localStorage.removeItem('email');
      localStorage.removeItem('phone');
      localStorage.removeItem('location');
      sessionStorage.removeItem('citizen_logged_in');
    } catch (err) {
      console.warn('Storage unavailable:', err);
    }
    window.location.href = 'citizen-login.html';
  };

  // Profile Form State with safe demo defaults
  const [profileData, setProfileData] = useState({
    fullName: 'Citizen User',
    email: 'citizen@example.com',
    phone: '+91 XXXXX XXXXX',
    location: 'Puducherry, India'
  });

  // Settings toggles (UI controls)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [localSandboxOnly, setLocalSandboxOnly] = useState(true);

  // Dynamic incident reports count from localStorage
  const [incidentCount, setIncidentCount] = useState(0);

  // Initialize theme, profile, and incident count from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Load any locally stored profile values if available
    const storedName = localStorage.getItem('fullname');
    const storedEmail = localStorage.getItem('email');
    const storedPhone = localStorage.getItem('phone');
    const storedLocation = localStorage.getItem('location');

    setProfileData(prev => ({
      fullName: storedName || prev.fullName,
      email: storedEmail || prev.email,
      phone: storedPhone || prev.phone,
      location: storedLocation || prev.location
    }));

    // Read saved reports count
    try {
      const reports = JSON.parse(localStorage.getItem('cyberReports') || '[]');
      setIncidentCount(Array.isArray(reports) ? reports.length : 0);
    } catch (e) {
      setIncidentCount(0);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = (e) => {
    e?.preventDefault();
    localStorage.setItem('fullname', profileData.fullName);
    localStorage.setItem('email', profileData.email);
    localStorage.setItem('phone', profileData.phone);
    localStorage.setItem('location', profileData.location);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleCancelEdit = () => {
    // Revert to localStorage or defaults
    const storedName = localStorage.getItem('fullname');
    const storedEmail = localStorage.getItem('email');
    const storedPhone = localStorage.getItem('phone');
    const storedLocation = localStorage.getItem('location');

    setProfileData({
      fullName: storedName || 'Citizen User',
      email: storedEmail || 'citizen@example.com',
      phone: storedPhone || '+91 XXXXX XXXXX',
      location: storedLocation || 'Puducherry, India'
    });
    setIsEditing(false);
  };

  // Derive initials: "CI"
  const avatarInitials = 'CI';

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

        {/* Top Navigation Bar: Overview | Security Modules | Incident Logs | Statutory Laws */}
        <nav className="header-nav" aria-label="Console Navigation">
          <a href="/dashboard.html" className="nav-item">Overview</a>
          <a href="/tool-dashboard.html" className="nav-item">Security Modules</a>
          <a href="/incident-logs.html" className="nav-item">Incident Logs</a>
          <a href="/user-cyber-laws.html" className="nav-item">Statutory Laws</a>
        </nav>

        <div className="header-actions">
          <div className="system-status-indicator" title="Profile Active">
            <span className="indicator-dot" />
            <span className="status-indicator-text">Profile Active</span>
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

          {/* Citizen profile access through existing profile/avatar area */}
          <a href="/profile.html" className="user-badge" title="Citizen Profile" style={{ borderColor: 'var(--brand-blue)', background: 'var(--brand-blue-subtle)' }}>
            <div className="user-avatar-circle" style={{ background: 'var(--brand-blue)', color: '#ffffff', fontWeight: 700 }}>
              {avatarInitials}
            </div>
            <span className="user-name-text">Citizen</span>
          </a>

          {/* Header Quick Logout Button */}
          <button 
            type="button" 
            className="header-logout-btn" 
            onClick={() => setModalType('logout')} 
            title="Log out of Citizen Portal"
            aria-label="Logout"
          >
            <LogOut size={15} />
            <span className="header-logout-text">Logout</span>
          </button>
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
          <a href="/user-cyber-laws.html" className="nav-item" style={{ padding: '10px 14px' }}>Statutory Laws</a>
          <a href="/profile.html" className="nav-item active" style={{ padding: '10px 14px', color: 'var(--brand-blue)', fontWeight: 600 }}>Citizen Profile</a>
          <button 
            type="button" 
            onClick={() => { setIsMobileMenuOpen(false); setModalType('logout'); }}
            className="nav-item"
            style={{ 
              padding: '10px 14px', 
              color: '#ef4444', 
              fontWeight: 600, 
              background: 'none', 
              border: 'none', 
              textAlign: 'left', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8 
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Main Full-Width Dedicated Page Worksurface */}
      <main className="console-main profile-page-main">
        <div className="profile-container">

          {/* PAGE TITLE & SUBTITLE */}
          <section className="profile-hero-panel">
            <div className="profile-badge-tag">
              <User size={13} />
              Citizen Account Management
            </div>

            <div className="profile-hero-header">
              <h1>Citizen Profile</h1>
              <p className="hero-subtitle">Manage your CyberCouncil account and personal preferences.</p>
            </div>
          </section>

          {/* PROFILE HEADER CARD */}
          <section className="profile-card-panel" aria-label="Citizen Account Card">
            <div className="profile-identity-cluster">
              <div className="profile-large-avatar" aria-label="Citizen Avatar">
                {avatarInitials}
              </div>

              <div className="profile-identity-info">
                <h2>
                  Citizen
                  <span className="overview-badge-tag" style={{ margin: 0, fontSize: '11px', padding: '2px 8px' }}>
                    <ShieldCheck size={12} />
                    Verified Client
                  </span>
                </h2>

                <div className="profile-meta-tags">
                  <div className="meta-pill">
                    <span>Account:</span>
                    <strong>Citizen</strong>
                  </div>
                  <div className="meta-pill">
                    <span className="status-active-dot" />
                    <span>Status:</span>
                    <strong style={{ color: 'var(--status-green)' }}>Active</strong>
                  </div>
                  <div className="meta-pill">
                    <Calendar size={13} style={{ color: 'var(--brand-blue)' }} />
                    <span>Member since:</span>
                    <strong>September 2026</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-header-actions">
              <button 
                type="button" 
                className="btn-edit-profile"
                onClick={() => setIsEditing(!isEditing)}
                aria-expanded={isEditing}
              >
                <Edit3 size={15} />
                <span>{isEditing ? 'Close Editing' : 'Edit Profile'}</span>
              </button>

              <button 
                type="button" 
                className="btn-logout-profile"
                onClick={() => setModalType('logout')}
                title="Log out of Citizen Portal"
                aria-label="Logout"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          </section>

          {/* PERSONAL INFORMATION SECTION */}
          <section className="profile-section-card" aria-label="Personal Information">
            <div className="profile-section-title">
              <div>
                <h3>
                  <User size={19} style={{ color: 'var(--brand-blue)' }} />
                  Personal Information
                </h3>
                <p>Editable demo values stored locally in your browser session for platform personalization.</p>
              </div>

              {saveSuccess && (
                <div className="save-feedback-badge" role="status">
                  <CheckCircle2 size={16} />
                  <span>Profile updated locally in browser storage!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="personal-info-form">
              <div className="personal-info-grid">
                
                {/* Full Name */}
                <div className="info-field-box">
                  <label htmlFor="fieldFullName">Full Name</label>
                  <div className="info-input-wrapper">
                    <User size={16} className="info-input-icon" />
                    <input 
                      type="text" 
                      id="fieldFullName"
                      className="info-field-input" 
                      value={profileData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g. Citizen User"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="info-field-box">
                  <label htmlFor="fieldEmail">Email Address</label>
                  <div className="info-input-wrapper">
                    <Mail size={16} className="info-input-icon" />
                    <input 
                      type="email" 
                      id="fieldEmail"
                      className="info-field-input" 
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g. citizen@example.com"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="info-field-box">
                  <label htmlFor="fieldPhone">Phone Number</label>
                  <div className="info-input-wrapper">
                    <Phone size={16} className="info-input-icon" />
                    <input 
                      type="text" 
                      id="fieldPhone"
                      className="info-field-input" 
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g. +91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                {/* State / City */}
                <div className="info-field-box">
                  <label htmlFor="fieldLocation">State / City</label>
                  <div className="info-input-wrapper">
                    <MapPin size={16} className="info-input-icon" />
                    <input 
                      type="text" 
                      id="fieldLocation"
                      className="info-field-input" 
                      value={profileData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g. Puducherry, India"
                    />
                  </div>
                </div>

              </div>

              {isEditing && (
                <div className="personal-info-actions">
                  <button type="submit" className="btn-save-info">
                    <Save size={15} />
                    <span>Save Changes</span>
                  </button>
                  <button type="button" className="btn-cancel-info" onClick={handleCancelEdit}>
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </form>
          </section>

          {/* SECURITY STATUS SECTION */}
          <section className="profile-section-card" aria-label="Security Status">
            <div className="profile-section-title">
              <div>
                <h3>
                  <ShieldCheck size={19} style={{ color: 'var(--brand-blue)' }} />
                  Security Status
                </h3>
                <p>System posture, client sandbox status, and diagnostic metrics.</p>
              </div>
            </div>

            <div className="security-status-grid">
              
              <div className="status-metric-card">
                <span className="metric-label">Account Status</span>
                <span className="metric-value" style={{ color: 'var(--status-green)' }}>
                  <span className="status-active-dot" />
                  Active
                </span>
                <span className="metric-subtext">Verified Citizen Session</span>
              </div>

              <div className="status-metric-card">
                <span className="metric-label">Shield Status</span>
                <span className="metric-value" style={{ color: 'var(--brand-blue)' }}>
                  <Shield size={18} />
                  Active
                </span>
                <span className="metric-subtext">Client Threat Defense</span>
              </div>

              <div className="status-metric-card">
                <span className="metric-label">Security Modules Available</span>
                <span className="metric-value">7</span>
                <span className="metric-subtext">All Operational</span>
              </div>

              <div className="status-metric-card">
                <span className="metric-label">Incident Reports</span>
                <span className="metric-value">{incidentCount}</span>
                <span className="metric-subtext">Recorded in Browser</span>
              </div>

              <div className="status-metric-card">
                <span className="metric-label">Saved Records</span>
                <span className="metric-value" style={{ color: '#8250df' }}>Local</span>
                <span className="metric-subtext">Zero External Transmission</span>
              </div>

            </div>
          </section>

          {/* ACTIVITY SUMMARY (3 CLICKABLE CARDS) */}
          <section className="profile-section-card" aria-label="Activity Summary">
            <div className="profile-section-title">
              <div>
                <h3>
                  <Clock size={19} style={{ color: 'var(--brand-blue)' }} />
                  Activity Summary
                </h3>
                <p>Direct shortcuts into your diagnostic history and reference logs.</p>
              </div>
            </div>

            <div className="activity-summary-grid">
              
              {/* Card 1: Security Checks */}
              <a href="/tool-dashboard.html" className="activity-card">
                <div>
                  <div className="activity-card-head">
                    <div className="activity-icon-badge">
                      <ShieldCheck size={22} />
                    </div>
                    <span className="overview-badge-tag" style={{ margin: 0 }}>7 Modules</span>
                  </div>
                  <h4>Security Checks</h4>
                  <p>View your security tool activity</p>
                </div>
                <div className="activity-card-footer">
                  <span>Open Security Modules</span>
                  <ArrowRight size={14} />
                </div>
              </a>

              {/* Card 2: Incident Reports */}
              <a href="/incident-logs.html#history" className="activity-card">
                <div>
                  <div className="activity-card-head">
                    <div className="activity-icon-badge" style={{ color: '#9a6700', background: 'rgba(210, 153, 34, 0.12)', borderColor: 'rgba(210, 153, 34, 0.3)' }}>
                      <FileWarning size={22} />
                    </div>
                    <span className="overview-badge-tag" style={{ margin: 0, color: '#9a6700', borderColor: 'rgba(210, 153, 34, 0.3)', background: 'rgba(210, 153, 34, 0.1)' }}>{incidentCount} Logged</span>
                  </div>
                  <h4>Incident Reports</h4>
                  <p>View your submitted/saved incident records</p>
                </div>
                <div className="activity-card-footer" style={{ color: '#9a6700' }}>
                  <span>Open Incident Logs</span>
                  <ArrowRight size={14} />
                </div>
              </a>

              {/* Card 3: Legal References */}
              <a href="/user-cyber-laws.html" className="activity-card">
                <div>
                  <div className="activity-card-head">
                    <div className="activity-icon-badge" style={{ color: '#8250df', background: 'rgba(130, 80, 223, 0.12)', borderColor: 'rgba(130, 80, 223, 0.3)' }}>
                      <Scale size={22} />
                    </div>
                    <span className="overview-badge-tag" style={{ margin: 0, color: '#8250df', borderColor: 'rgba(130, 80, 223, 0.3)', background: 'rgba(130, 80, 223, 0.1)' }}>18 Sections</span>
                  </div>
                  <h4>Legal References</h4>
                  <p>View cyber law sections you have accessed</p>
                </div>
                <div className="activity-card-footer" style={{ color: '#8250df' }}>
                  <span>Open Statutory Laws</span>
                  <ArrowRight size={14} />
                </div>
              </a>

            </div>
          </section>

          {/* QUICK ACTIONS ROW */}
          <section className="profile-section-card" aria-label="Quick Actions">
            <div className="profile-section-title">
              <div>
                <h3>
                  <ExternalLink size={19} style={{ color: 'var(--brand-blue)' }} />
                  Quick Actions
                </h3>
                <p>Navigate directly to primary platform functions.</p>
              </div>
            </div>

            <div className="profile-quick-actions-row">
              <a href="/tool-dashboard.html" className="profile-action-btn">
                <Shield size={16} />
                <span>Security Modules</span>
              </a>
              <a href="/incident-logs.html" className="profile-action-btn">
                <FileWarning size={16} />
                <span>Incident History</span>
              </a>
              <a href="/user-cyber-laws.html" className="profile-action-btn">
                <Scale size={16} />
                <span>Statutory Laws</span>
              </a>
            </div>
          </section>

          {/* ACCOUNT SETTINGS SECTION */}
          <section className="profile-section-card" aria-label="Account Settings">
            <div className="profile-section-title">
              <div>
                <h3>
                  <Lock size={19} style={{ color: 'var(--brand-blue)' }} />
                  Account Settings
                </h3>
                <p>Manage your client privacy options, alerts, and credential preferences.</p>
              </div>
            </div>

            <div className="account-settings-list">
              
              {/* Option 1: Edit Personal Information */}
              <div className="setting-item-box">
                <div className="setting-item-info">
                  <strong>Edit Personal Information</strong>
                  <span>Update your name, demo email, and regional city.</span>
                </div>
                <button 
                  type="button" 
                  className="setting-action-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              </div>

              {/* Option 2: Change Password */}
              <div className="setting-item-box">
                <div className="setting-item-info">
                  <strong>Change Password</strong>
                  <span>Update your local authentication passphrase.</span>
                </div>
                <button 
                  type="button" 
                  className="setting-action-btn"
                  onClick={() => setModalType('password')}
                >
                  Change
                </button>
              </div>

              {/* Option 3: Notification Preferences */}
              <div className="setting-item-box">
                <div className="setting-item-info">
                  <strong>Notification Preferences</strong>
                  <span>Receive in-browser security alerts for suspicious findings.</span>
                </div>
                <label className="switch-label" title="Toggle browser security alerts">
                  <input 
                    type="checkbox" 
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              {/* Option 4: Privacy Preferences */}
              <div className="setting-item-box">
                <div className="setting-item-info">
                  <strong>Privacy Preferences</strong>
                  <span>Enforce strict local sandboxing and zero telemetry leaks.</span>
                </div>
                <label className="switch-label" title="Toggle client sandbox isolation">
                  <input 
                    type="checkbox" 
                    checked={localSandboxOnly}
                    onChange={(e) => setLocalSandboxOnly(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              {/* Option 5: Session & Logout */}
              <div className="setting-item-box setting-item-danger">
                <div className="setting-item-info">
                  <strong style={{ color: '#ef4444' }}>Session &amp; Logout</strong>
                  <span>End your active citizen session and return to the login portal.</span>
                </div>
                <button 
                  type="button" 
                  className="btn-logout-profile"
                  onClick={() => setModalType('logout')}
                  style={{ padding: '8px 14px', fontSize: '13px' }}
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>

            </div>
          </section>

          {/* PRIVACY NOTICE BANNER */}
          <div className="profile-privacy-box" role="note">
            <HelpCircle size={18} />
            <div>
              <strong>Privacy Notice: </strong>
              Your profile information is used to personalize the CyberCouncil citizen experience. Do not enter passwords, OTPs, banking PINs, or other sensitive credentials. All demographic fields are stored strictly within your browser's private local environment.
            </div>
          </div>

          {/* FOOTER */}
          <footer className="profile-page-footer">
            <div>
              &copy; 2026 CyberCouncil. Public Citizen Cybersecurity &amp; Incident Response Console.
            </div>
            <div className="profile-footer-links">
              <a href="/dashboard.html">Overview</a>
              <a href="/tool-dashboard.html">Security Modules</a>
              <a href="/incident-logs.html">Incident Logs</a>
              <a href="/user-cyber-laws.html">Statutory Laws</a>
            </div>
          </footer>

        </div>
      </main>

      {/* Settings Modal (UI only demo for Change Password) */}
      {modalType === 'password' && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16
          }}
          onClick={() => setModalType(null)}
        >
          <div 
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px 28px',
              maxWidth: 440,
              width: '100%',
              boxShadow: 'var(--shadow-card-hover)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <KeyRound size={18} style={{ color: 'var(--brand-blue)' }} />
                Change Password
              </h3>
              <button 
                type="button" 
                onClick={() => setModalType(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              CyberCouncil operates client-side. To test your password resilience, use the <a href="/tool-dashboard.html#password-auditor" style={{ color: 'var(--brand-blue)' }}>Password Auditor</a> module.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button 
                type="button" 
                className="btn-save-info"
                onClick={() => setModalType(null)}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {modalType === 'logout' && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16
          }}
          onClick={() => setModalType(null)}
        >
          <div 
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px 28px',
              maxWidth: 440,
              width: '100%',
              boxShadow: 'var(--shadow-card-hover)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <LogOut size={18} style={{ color: '#ef4444' }} />
                Log Out of Citizen Portal
              </h3>
              <button 
                type="button" 
                onClick={() => setModalType(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Are you sure you want to end your active session? You will be redirected to the citizen authentication page.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button 
                type="button" 
                className="btn-cancel-info"
                onClick={() => setModalType(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-logout-confirm"
                onClick={handleConfirmLogout}
              >
                <LogOut size={15} />
                <span>Yes, Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
