import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Wifi,
  FileSearch,
  FileCode,
  FileCheck2,
  FileWarning,
  Eye,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  KeyRound,
  FileText,
  Clock,
  Send,
  HelpCircle,
  Sun,
  Moon,
  Menu,
  X,
  Search,
  Scale
} from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/overview.css';

export default function OverviewPage() {
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

  // 7 Citizen Security Modules List
  const securityModules = [
    {
      id: 'phishing-scanner',
      name: 'Phishing Scanner',
      icon: <ShieldAlert size={18} />,
      desc: 'Inspect suspicious URLs and domains against phishing patterns, spoofing heuristics, and deceptive redirections.',
      link: '/tool-dashboard.html#phishing-scanner'
    },
    {
      id: 'password-auditor',
      name: 'Password Auditor',
      icon: <KeyRound size={18} />,
      desc: 'Evaluate passphrase entropy, crack times, and common vulnerabilities entirely in-browser without transmission.',
      link: '/tool-dashboard.html#password-auditor'
    },
    {
      id: 'network-inspector',
      name: 'Network Inspector',
      icon: <Wifi size={18} />,
      desc: 'Audit client connection parameters, public IP exposure, WebRTC leaks, latency, and DNS safety configurations.',
      link: '/tool-dashboard.html#network-inspector'
    },
    {
      id: 'social-engineering',
      name: 'Social Engineering Detector',
      icon: <FileSearch size={18} />,
      desc: 'Scan email texts and SMS messages for urgency triggers, psychological coercion, impersonation, and fraudulent hooks.',
      link: '/tool-dashboard.html#social-engineering'
    },
    {
      id: 'payload-scanner',
      name: 'Payload / Malware Scanner',
      icon: <FileCode size={18} />,
      desc: 'Detect malicious signatures, embedded macros, and harmful payloads using VirusTotal intelligence and local heuristics.',
      link: '/tool-dashboard.html#payload-scanner'
    },
    {
      id: 'privacy-auditor',
      name: 'Privacy Policy Analyzer',
      icon: <Eye size={18} />,
      desc: 'Review lengthy privacy policies and terms to flag third-party data tracking, retention risks, and rights waivers.',
      link: '/tool-dashboard.html#privacy-auditor'
    },
    {
      id: 'file-metadata-inspector',
      name: 'File Metadata & Privacy Inspector',
      icon: <FileCheck2 size={18} />,
      desc: 'Inspect hidden EXIF data, GPS coordinates, camera models, and sanitize sensitive file tags before sharing online.',
      link: '/tool-dashboard.html#file-metadata-inspector'
    }
  ];

  // 4-step Incident Reporting Workflow
  const reportingWorkflowSteps = [
    {
      step: 1,
      title: 'Classify the incident',
      desc: 'Select from standardized threat categories like phishing, financial fraud, account compromise, or identity theft.'
    },
    {
      step: 2,
      title: 'Provide incident details',
      desc: 'Specify the occurrence timestamp, platform or service involved, narrative description, and suspected impact.'
    },
    {
      step: 3,
      title: 'Add supporting evidence',
      desc: 'Attach screenshots, export logs, suspicious URLs, phone numbers, or IP addresses involved in the breach.'
    },
    {
      step: 4,
      title: 'Review and save the report',
      desc: 'Verify report completeness, obtain a tamper-resistant local tracking ID, and securely export JSON logs.'
    }
  ];

  // Cyber Law Categories
  const cyberLawTopics = [
    {
      title: 'Cyber Offences',
      sections: 'Sec. 43, 65, 66',
      desc: 'Unauthorized computer access, source code tampering, and computer-related offences.'
    },
    {
      title: 'Identity Theft',
      sections: 'Sec. 66C',
      desc: 'Fraudulent use of digital signatures, passwords, and unique biometric identification.'
    },
    {
      title: 'Online Impersonation',
      sections: 'Sec. 66D',
      desc: 'Cheating and financial extortion by impersonating another person via computer systems.'
    },
    {
      title: 'Privacy Violations',
      sections: 'Sec. 43A, 66E, 72, 72A',
      desc: 'Capturing private images without consent, corporate data negligence, and breach of confidentiality.'
    },
    {
      title: 'Electronic Records',
      sections: 'Sec. 65, 70',
      desc: 'Tampering with digital records and unauthorized access to protected critical computer infrastructure.'
    },
    {
      title: 'Intermediary & Cybersecurity',
      sections: 'Sec. 69, 69A, 69B',
      desc: 'Directions for interception, blocking unlawful online access, and monitoring cyber traffic data.'
    }
  ];

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

        {/* Top Navigation Bar: Overview active */}
        <nav className="header-nav" aria-label="Console Navigation">
          <a href="/dashboard.html" className="nav-item active">Overview</a>
          <a href="/tool-dashboard.html" className="nav-item">Security Modules</a>
          <a href="/incident-logs.html" className="nav-item">Incident Logs</a>
          <a href="/user-cyber-laws.html" className="nav-item">Statutory Laws</a>
        </nav>

        <div className="header-actions">
          <div className="system-status-indicator" title="System Operational">
            <span className="indicator-dot" />
            <span className="status-indicator-text">Shield Active</span>
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
          <a href="/dashboard.html" className="nav-item active" style={{ padding: '10px 14px' }}>Overview</a>
          <a href="/tool-dashboard.html" className="nav-item" style={{ padding: '10px 14px' }}>Security Modules</a>
          <a href="/incident-logs.html" className="nav-item" style={{ padding: '10px 14px' }}>Incident Logs</a>
          <a href="/user-cyber-laws.html" className="nav-item" style={{ padding: '10px 14px' }}>Statutory Laws</a>
        </div>
      )}

      {/* Main Full-Width Dedicated Page Worksurface */}
      <main className="console-main overview-page-main">
        <div className="overview-container">

          {/* PAGE HEADER & HERO BANNER */}
          <section className="overview-hero-panel">
            <div className="overview-badge-tag">
              <ShieldCheck size={14} />
              Citizen Cyber Defence Platform
            </div>

            <div className="overview-hero-header">
              <h1>CyberCouncil</h1>
              <p className="hero-subtitle">Citizen Cybersecurity &amp; Incident Response Platform</p>
              <p className="hero-desc">
                CyberCouncil is an integrated digital protection system designed to empower Indian citizens with automated diagnostic tools, sovereign evidence recording, and authoritative legal clarity under the Information Technology Act, 2000.
              </p>
            </div>

            {/* Feature Highlights Pills */}
            <div className="overview-feature-pills">
              <div className="overview-pill">
                <CheckCircle2 size={15} />
                <span>Identify common cyber threats</span>
              </div>
              <div className="overview-pill">
                <CheckCircle2 size={15} />
                <span>Inspect suspicious content</span>
              </div>
              <div className="overview-pill">
                <CheckCircle2 size={15} />
                <span>Protect personal information</span>
              </div>
              <div className="overview-pill">
                <CheckCircle2 size={15} />
                <span>Report cyber incidents</span>
              </div>
              <div className="overview-pill">
                <CheckCircle2 size={15} />
                <span>Understand relevant cyber laws</span>
              </div>
            </div>
          </section>

          {/* PRIMARY ACTIONS - 3 PROMINENT CARDS */}
          <section className="overview-primary-actions-grid" aria-label="Primary Platform Actions">
            
            {/* Card 1: Security Modules */}
            <div className="action-hero-card card-security">
              <div className="action-card-header">
                <div className="action-icon-badge security-theme">
                  <ShieldCheck size={26} />
                </div>
                <span className="overview-badge-tag" style={{ margin: 0 }}>7 Live Tools</span>
              </div>
              <div className="action-card-body">
                <h3>SECURITY MODULES</h3>
                <p>Inspect suspicious links, files, passwords, network information, and privacy risks.</p>
              </div>
              <a href="/tool-dashboard.html" className="action-hero-btn btn-security">
                <span>Explore Security Modules</span>
                <ArrowRight size={16} />
              </a>
            </div>

            {/* Card 2: Report a Cyber Incident */}
            <div className="action-hero-card card-incident">
              <div className="action-card-header">
                <div className="action-icon-badge incident-theme">
                  <FileWarning size={26} />
                </div>
                <span className="overview-badge-tag" style={{ margin: 0, color: '#9a6700', borderColor: 'rgba(210, 153, 34, 0.4)', background: 'rgba(210, 153, 34, 0.1)' }}>Local Vault</span>
              </div>
              <div className="action-card-body">
                <h3>REPORT A CYBER INCIDENT</h3>
                <p>Document and record a suspected cyber incident with relevant evidence and details.</p>
              </div>
              <a href="/incident-logs.html" className="action-hero-btn btn-incident">
                <span>Report an Incident</span>
                <ArrowRight size={16} />
              </a>
            </div>

            {/* Card 3: Statutory Laws */}
            <div className="action-hero-card card-laws">
              <div className="action-card-header">
                <div className="action-icon-badge laws-theme">
                  <Scale size={26} />
                </div>
                <span className="overview-badge-tag" style={{ margin: 0, color: '#8250df', borderColor: 'rgba(130, 80, 223, 0.4)', background: 'rgba(130, 80, 223, 0.1)' }}>IT Act 2000</span>
              </div>
              <div className="action-card-body">
                <h3>STATUTORY LAWS</h3>
                <p>Explore relevant Indian cyber law provisions in a simple citizen-friendly format.</p>
              </div>
              <a href="/user-cyber-laws.html" className="action-hero-btn btn-laws">
                <span>View Cyber Laws</span>
                <ArrowRight size={16} />
              </a>
            </div>

          </section>

          {/* QUICK ACCESS STRIP */}
          <section className="overview-quick-access-panel" aria-label="Quick Access Shortcuts">
            <div className="quick-access-title">
              <ExternalLink size={16} />
              <span>Quick Access</span>
            </div>
            <div className="quick-access-links">
              <a href="/tool-dashboard.html" className="quick-link-item">
                <Shield size={14} />
                <span>Security Modules</span>
              </a>
              <a href="/incident-logs.html" className="quick-link-item">
                <FileWarning size={14} />
                <span>Report Incident</span>
              </a>
              <a href="/incident-logs.html#history" className="quick-link-item">
                <Clock size={14} />
                <span>Incident History</span>
              </a>
              <a href="/user-cyber-laws.html" className="quick-link-item">
                <BookOpen size={14} />
                <span>Statutory Laws</span>
              </a>
            </div>
          </section>

          {/* SECURITY MODULES OVERVIEW */}
          <section className="overview-section-card" aria-label="Security Modules Overview">
            <div className="overview-section-header">
              <div className="overview-section-titles">
                <h2>
                  <ShieldCheck size={20} style={{ color: 'var(--brand-blue)' }} />
                  Security Modules Overview
                </h2>
                <p>Diagnostic cybersecurity modules operating client-side to safeguard your digital presence.</p>
              </div>
              <a href="/tool-dashboard.html" className="section-cta-btn">
                <span>View All Security Modules</span>
                <ArrowRight size={15} />
              </a>
            </div>

            <div className="security-tools-grid">
              {securityModules.map((mod) => (
                <a key={mod.id} href={mod.link} className="security-tool-card">
                  <div className="tool-card-head">
                    <div className="tool-card-identity">
                      <div className="tool-card-icon">
                        {mod.icon}
                      </div>
                      <h4>{mod.name}</h4>
                    </div>
                    <ArrowRight size={16} className="tool-card-arrow" />
                  </div>
                  <p>{mod.desc}</p>
                </a>
              ))}
            </div>
          </section>

          {/* TWO-COLUMN WORKSPACE: INCIDENT REPORTING & CYBER LAWS */}
          <div className="overview-dual-grid">

            {/* INCIDENT REPORTING OVERVIEW */}
            <section className="overview-section-card" aria-label="Incident Reporting Overview">
              <div className="overview-section-header">
                <div className="overview-section-titles">
                  <h2>
                    <FileWarning size={20} style={{ color: '#9a6700' }} />
                    Incident Reporting Overview
                  </h2>
                  <p>Step-by-step workflow for logging cybercrimes and compiling digital evidence.</p>
                </div>
                <a href="/incident-logs.html" className="section-cta-btn">
                  <span>Open Incident Reporting</span>
                  <ArrowRight size={15} />
                </a>
              </div>

              <div className="workflow-steps-list">
                {reportingWorkflowSteps.map((s) => (
                  <div key={s.step} className="workflow-step-item">
                    <div className="step-num-badge">{s.step}</div>
                    <div className="step-content">
                      <strong>{s.title}</strong>
                      <span>{s.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CYBER LAW OVERVIEW */}
            <section className="overview-section-card" aria-label="Cyber Law Overview">
              <div className="overview-section-header">
                <div className="overview-section-titles">
                  <h2>
                    <Scale size={20} style={{ color: '#8250df' }} />
                    Statutory Laws &amp; Cyber Law Reference
                  </h2>
                  <p>Citizen-friendly explanations of the Information Technology Act, 2000 provisions.</p>
                </div>
                <a href="/user-cyber-laws.html" className="section-cta-btn">
                  <span>Explore Statutory Laws</span>
                  <ArrowRight size={15} />
                </a>
              </div>

              <div className="law-categories-matrix">
                {cyberLawTopics.map((item, idx) => (
                  <a key={idx} href="/user-cyber-laws.html" className="law-category-card">
                    <div className="cat-title">
                      <span>{item.title}</span>
                      <small style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>{item.sections}</small>
                    </div>
                    <span className="cat-desc">{item.desc}</span>
                  </a>
                ))}
              </div>
            </section>

          </div>

          {/* LEGAL DISCLAIMER BANNER */}
          <div className="overview-disclaimer-box" role="note">
            <HelpCircle size={18} />
            <div>
              <strong>Legal &amp; Advisory Notice: </strong>
              This page provides general legal information and is not legal advice. For authoritative interpretation, refer to the official legislation and qualified legal professionals. To file an official police complaint or freeze fraudulent financial transfers in India, contact the National Cyber Crime Reporting Portal at <strong>cybercrime.gov.in</strong> or emergency helpline <strong>1930</strong>.
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
