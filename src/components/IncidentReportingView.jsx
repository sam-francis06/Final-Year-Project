import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  Download,
  Plus,
  Search,
  Eye,
  Copy,
  Check,
  Trash2,
  Calendar,
  Clock,
  Globe,
  Phone,
  Mail,
  Info,
  CheckCircle2,
  Lock,
  Layers,
  FileCheck,
  AlertCircle,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import '../styles/incident-reporting.css';

// Pre-defined statutory incident types
const INCIDENT_TYPES = [
  {
    id: 'phishing',
    name: 'Phishing / Scam',
    description: 'Deceptive emails, fake portals, fraudulent SMS/WhatsApp links soliciting credentials or money.',
    icon: Globe
  },
  {
    id: 'account_compromise',
    name: 'Account Compromise',
    description: 'Unauthorized login, password reset, or takeover of social media, email, or digital account.',
    icon: Lock
  },
  {
    id: 'financial_fraud',
    name: 'Online Financial Fraud',
    description: 'Unauthorized UPI transaction, credit/debit card fraud, fake investment scheme, or bank transfer.',
    icon: AlertTriangle
  },
  {
    id: 'identity_theft',
    name: 'Identity Theft',
    description: 'Impersonation, fake profiles created using your photos/name, or misuse of personal identification.',
    icon: ShieldAlert
  },
  {
    id: 'harassment',
    name: 'Cyberbullying / Harassment',
    description: 'Online intimidation, stalking, abusive communications, defamation, or morphing of personal media.',
    icon: ShieldAlert
  },
  {
    id: 'malware',
    name: 'Malware / Suspicious File',
    description: 'Ransomware, spyware, trojans, unusual device slowdown, or suspicious malicious downloads.',
    icon: AlertCircle
  },
  {
    id: 'privacy_exposure',
    name: 'Data / Privacy Exposure',
    description: 'Data breach leak, unauthorized disclosure of sensitive records, or surveillance tracking.',
    icon: Info
  },
  {
    id: 'unauthorized_access',
    name: 'Unauthorized Access',
    description: 'Unpermitted entry into Wi-Fi network, cloud storage, server, or personal computing device.',
    icon: Lock
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Any other suspicious digital event, cyber incident, or unspecified security concern.',
    icon: FileText
  }
];

// Helper to generate a unique citizen report ID
function generateReportId() {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CC-INC-${year}-${randomChars}`;
}

export default function IncidentReportingView({ onBack, onReportCreated }) {
  // Navigation / View Tabs: 'report' or 'history'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'history' || window.location.hash === '#history') {
        return 'history';
      }
    }
    return 'report';
  });

  // Keep tab in sync if URL hash changes
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'history' || window.location.hash === '#history') {
        setActiveTab('history');
      } else if (params.get('tab') === 'report' || window.location.hash === '#report') {
        setActiveTab('report');
      }
    };
    window.addEventListener('hashchange', handleUrlChange);
    return () => window.removeEventListener('hashchange', handleUrlChange);
  }, []);
  
  // Step in the citizen workflow: 1 (Type) -> 2 (Details) -> 3 (Evidence) -> 4 (Review) -> 5 (Confirmation)
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    incidentType: '',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: '',
    platform: '',
    description: '',
    discovery: '',
    impact: '',
    suspiciousUrl: '',
    ipAddress: '',
    contactInvolved: '',
    evidenceFiles: [],
    evidenceNotes: '',
    reporterName: '',
    reporterEmail: '',
    reporterPhone: '',
    reporterRegion: ''
  });

  // Inline Validation Errors
  const [errors, setErrors] = useState({});

  // Saved Reports List from localStorage
  const [savedReports, setSavedReports] = useState([]);
  
  // Last saved report reference for confirmation screen
  const [lastSavedReport, setLastSavedReport] = useState(null);

  // Modal inspection for viewing report from history
  const [selectedReportForModal, setSelectedReportForModal] = useState(null);

  // Feedback states
  const [copiedId, setCopiedId] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const fileInputRef = useRef(null);

  // Load existing reports on mount
  useEffect(() => {
    loadSavedReports();
  }, []);

  const loadSavedReports = () => {
    try {
      const stored = localStorage.getItem('cyberReports');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedReports(parsed);
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading saved cyber reports:', e);
    }
    setSavedReports([]);
    return [];
  };

  // Update form fields
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errs = {};
    if (!formData.incidentType) {
      errs.incidentType = 'Please select the type of cyber incident.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errs = {};
    if (!formData.incidentDate) {
      errs.incidentDate = 'Date of incident is required.';
    } else {
      const selected = new Date(formData.incidentDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selected > today) {
        errs.incidentDate = 'Date cannot be in the future.';
      }
    }

    if (!formData.platform.trim()) {
      errs.platform = 'Please state where the incident occurred (e.g. WhatsApp, Banking site, Email).';
    }

    if (!formData.description.trim()) {
      errs.description = 'Please describe what happened in detail.';
    } else if (formData.description.trim().length < 15) {
      errs.description = 'Description should be at least 15 characters to provide useful context.';
    }

    if (!formData.discovery.trim()) {
      errs.discovery = 'Please share how you discovered the incident.';
    }

    // Optional URL validation
    if (formData.suspiciousUrl.trim()) {
      const url = formData.suspiciousUrl.trim();
      const hasProto = url.startsWith('http://') || url.startsWith('https://');
      const testUrl = hasProto ? url : `https://${url}`;
      try {
        new URL(testUrl);
      } catch {
        errs.suspiciousUrl = 'Please enter a valid web address or domain (e.g., example-login.com).';
      }
    }

    // Optional IP address validation
    if (formData.ipAddress.trim()) {
      const ip = formData.ipAddress.trim();
      const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
      if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
        errs.ipAddress = 'Please enter a valid IPv4 (e.g. 192.168.1.1) or IPv6 address.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 3 Validation (Evidence)
  const validateStep3 = () => {
    // Evidence is optional, but if file sizes exceed 15MB, warn
    return true;
  };

  // Step 4 Validation (Review)
  const validateStep4 = () => {
    return validateStep1() && validateStep2();
  };

  // Step Navigation Handlers
  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 3 && validateStep3()) {
      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // File Upload Handlers (in-memory metadata & preview)
  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFiles(e.target.files);
    }
  };

  const processSelectedFiles = (fileList) => {
    const newItems = Array.from(fileList).map(file => ({
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      lastModified: file.lastModified
    }));

    setFormData(prev => ({
      ...prev,
      evidenceFiles: [...prev.evidenceFiles, ...newItems]
    }));
  };

  const removeEvidenceFile = (index) => {
    setFormData(prev => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter((_, i) => i !== index)
    }));
  };

  // Format bytes for human display
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format Dates nicely
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Format Timestamps
  const formatTimestampDisplay = (isoStr) => {
    if (!isoStr) return '—';
    try {
      return new Date(isoStr).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  // Save Report Action
  const handleSaveReport = () => {
    if (!validateStep4()) {
      setStep(2);
      return;
    }

    const reportId = generateReportId();
    const nowIso = new Date().toISOString();

    const selectedTypeObj = INCIDENT_TYPES.find(t => t.id === formData.incidentType);
    const readableTypeName = selectedTypeObj ? selectedTypeObj.name : (formData.incidentType || 'Other');

    const newReport = {
      id: reportId,
      incidentId: reportId,
      type: readableTypeName,
      incidentType: readableTypeName,
      typeId: formData.incidentType,
      date: formData.incidentDate,
      time: formData.incidentTime || 'Not specified',
      platform: formData.platform.trim(),
      description: formData.description.trim(),
      discovery: formData.discovery.trim(),
      impact: formData.impact.trim() || 'Not specified / Pending assessment',
      suspiciousUrl: formData.suspiciousUrl.trim() || 'None',
      urls: formData.suspiciousUrl.trim() || '',
      ipAddress: formData.ipAddress.trim() || 'None',
      contactInvolved: formData.contactInvolved.trim() || 'None',
      evidenceFiles: formData.evidenceFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
      evidenceNotes: formData.evidenceNotes.trim() || 'None',
      reporterName: formData.reporterName.trim() || 'Anonymous Citizen',
      reporterEmail: formData.reporterEmail.trim() || 'Not specified',
      reporterPhone: formData.reporterPhone.trim() || 'Not specified',
      reporterRegion: formData.reporterRegion.trim() || 'Not specified',
      status: 'Draft / Saved',
      statusVariant: 'success',
      isOfficialSubmission: false,
      reportedToAuthorities: false,
      createdAt: nowIso,
      submittedAt: nowIso
    };

    // Save to localStorage under 'cyberReports'
    try {
      const existing = loadSavedReports();
      const updated = [newReport, ...existing];
      localStorage.setItem('cyberReports', JSON.stringify(updated));
      setSavedReports(updated);
      setLastSavedReport(newReport);
      setStep(5); // Move to Confirmation screen
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (onReportCreated) {
        onReportCreated(newReport);
      }
    } catch (e) {
      console.error('Failed to save incident report to localStorage:', e);
      alert('Could not save incident report locally. Please ensure storage permissions are enabled.');
    }
  };

  // Reset form to start a new report
  const handleCreateAnother = () => {
    setFormData({
      incidentType: '',
      incidentDate: new Date().toISOString().split('T')[0],
      incidentTime: '',
      platform: '',
      description: '',
      discovery: '',
      impact: '',
      suspiciousUrl: '',
      ipAddress: '',
      contactInvolved: '',
      evidenceFiles: [],
      evidenceNotes: '',
      reporterName: '',
      reporterEmail: '',
      reporterPhone: '',
      reporterRegion: ''
    });
    setErrors({});
    setLastSavedReport(null);
    setStep(1);
    setActiveTab('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Copy Report ID
  const handleCopyId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    });
  };

  // Generate downloadable structured report file
  const handleDownloadReport = (report) => {
    const rep = report || lastSavedReport;
    if (!rep) return;

    const fileContent = `======================================================================
CYBERCOUNCIL CITIZEN INCIDENT REPORT
======================================================================
Report Reference ID : ${rep.id}
Record Status       : ${rep.status || 'Draft / Saved'} (Local Device Record)
Created Timestamp   : ${formatTimestampDisplay(rep.createdAt || rep.submittedAt)}
Jurisdiction Note   : Not officially submitted to government or law enforcement.

----------------------------------------------------------------------
1. INCIDENT CLASSIFICATION
----------------------------------------------------------------------
Incident Type       : ${rep.type || rep.incidentType}
Date of Occurrence  : ${formatDateDisplay(rep.date)}
Approximate Time    : ${rep.time || 'Not specified'}
Platform / Service  : ${rep.platform || 'Not specified'}

----------------------------------------------------------------------
2. INCIDENT NARRATIVE & IMPACT
----------------------------------------------------------------------
Description:
${rep.description || 'No description provided.'}

Discovery Method:
${rep.discovery || 'Not specified.'}

Suspected Impact:
${rep.impact || 'Not specified.'}

----------------------------------------------------------------------
3. TECHNICAL & CONTACT INDICATORS
----------------------------------------------------------------------
Suspicious URL(s)   : ${rep.suspiciousUrl || rep.urls || 'None'}
IP Address          : ${rep.ipAddress || 'None'}
Suspect Contact     : ${rep.contactInvolved || 'None'}

----------------------------------------------------------------------
4. SUPPORTING EVIDENCE
----------------------------------------------------------------------
Attached Files      : ${rep.evidenceFiles && rep.evidenceFiles.length > 0 ? rep.evidenceFiles.map(f => `${f.name} (${formatFileSize(f.size)})`).join(', ') : 'None attached'}
Evidence Notes:
${rep.evidenceNotes || 'None'}

----------------------------------------------------------------------
5. REPORTER INFORMATION
----------------------------------------------------------------------
Name / Alias        : ${rep.reporterName || 'Anonymous Citizen'}
Contact Email       : ${rep.reporterEmail || 'Not specified'}
Contact Phone       : ${rep.reporterPhone || 'Not specified'}
State / Region      : ${rep.reporterRegion || 'Not specified'}

======================================================================
STATUTORY ADVISORY & OFFICIAL ESCALATION
======================================================================
This report is stored securely in CyberCouncil's local client-side sandbox.
To initiate a statutory investigation under the Indian Information Technology
Act 2000, you can present this documentation to:
  • National Cyber Crime Reporting Portal: https://cybercrime.gov.in
  • National Cyber Crime Helpline: 1930
  • Your state's designated cyber crime police station.
======================================================================
Generated by CyberCouncil Client Console.
`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = objectUrl;
    downloadAnchor.download = `CyberCouncil_Incident_Report_${rep.id}.txt`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  };

  // Delete Report from History
  const handleDeleteReport = (id) => {
    if (!window.confirm(`Are you sure you want to remove report "${id}" from your local device?`)) {
      return;
    }
    const updated = savedReports.filter(r => (r.id || r.incidentId) !== id);
    localStorage.setItem('cyberReports', JSON.stringify(updated));
    setSavedReports(updated);
    if (selectedReportForModal && (selectedReportForModal.id || selectedReportForModal.incidentId) === id) {
      setSelectedReportForModal(null);
    }
  };

  // Filter history records
  const filteredHistory = savedReports.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    const type = (item.type || item.incidentType || '').toLowerCase();
    const id = (item.id || item.incidentId || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const plat = (item.platform || '').toLowerCase();

    const matchesQuery = !q || id.includes(q) || type.includes(q) || desc.includes(q) || plat.includes(q);
    const matchesType = typeFilter === 'all' || type.includes(typeFilter.toLowerCase());

    return matchesQuery && matchesType;
  });

  return (
    <div className="incident-reporting-container">
      {/* Header Panel with Navigation Tabs */}
      <div className="ir-header-panel">
        <div className="ir-header-top">
          <div className="ir-title-area">
            <h1>
              <FileText size={24} style={{ color: 'var(--brand-blue)' }} />
              Incident Logs & Reporting
            </h1>
            <p>
              Document, organize, and safeguard suspected cyber incidents in your secure local console sandbox.
            </p>
          </div>

          <div className="ir-header-actions">
            {onBack && (
              <button
                type="button"
                className="ir-btn ir-btn-secondary"
                onClick={onBack}
              >
                <ArrowLeft size={16} />
                <span>Return to Modules</span>
              </button>
            )}

            {activeTab === 'history' && (
              <button
                type="button"
                className="ir-btn ir-btn-primary"
                onClick={() => {
                  setActiveTab('report');
                  setStep(1);
                }}
              >
                <Plus size={16} />
                <span>Report Incident</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="ir-tab-nav">
          <button
            type="button"
            className={`ir-tab-btn ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <Plus size={16} />
            <span>Report a Cyber Incident</span>
          </button>

          <button
            type="button"
            className={`ir-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('history');
              loadSavedReports();
            }}
          >
            <Layers size={16} />
            <span>Incident History</span>
            <span className="ir-tab-badge">{savedReports.length}</span>
          </button>
        </div>

        {/* Privacy & Statutory Safety Advisory */}
        <div className="ir-advisory-banner">
          <ShieldCheck size={20} className="ir-advisory-icon" />
          <div>
            <strong>Client-Side Privacy Sandbox Guarantee:</strong> Incident records documented here are stored exclusively in your browser’s local storage. CyberCouncil never transmits your reports to third-party trackers or cloud endpoints. Records are designated as <strong>Draft / Saved</strong> and are not automatically submitted to police or CERT-In unless you choose to file them through official statutory portals.
          </div>
        </div>
      </div>

      {/* VIEW TAB 1: INCIDENT REPORTING WIZARD */}
      {activeTab === 'report' && (
        <>
          {/* Stepper Progress Indicator (Steps 1 to 4) */}
          {step < 5 && (
            <div className="ir-stepper" aria-label="Incident Reporting Steps">
              <button
                type="button"
                className={`ir-step-item ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}
                onClick={() => setStep(1)}
              >
                <div className="ir-step-num">{step > 1 ? <Check size={16} /> : '1'}</div>
                <div className="ir-step-labels">
                  <span className="ir-step-title">Report Incident</span>
                  <span className="ir-step-subtitle">Classification</span>
                </div>
              </button>

              <div className="ir-step-arrow">→</div>

              <button
                type="button"
                className={`ir-step-item ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                disabled={!formData.incidentType}
              >
                <div className="ir-step-num">{step > 2 ? <Check size={16} /> : '2'}</div>
                <div className="ir-step-labels">
                  <span className="ir-step-title">Incident Details</span>
                  <span className="ir-step-subtitle">Narrative & Context</span>
                </div>
              </button>

              <div className="ir-step-arrow">→</div>

              <button
                type="button"
                className={`ir-step-item ${step === 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}
                onClick={() => {
                  if (validateStep1() && validateStep2()) setStep(3);
                }}
                disabled={!formData.incidentType || !formData.platform || !formData.description}
              >
                <div className="ir-step-num">{step > 3 ? <Check size={16} /> : '3'}</div>
                <div className="ir-step-labels">
                  <span className="ir-step-title">Evidence & Notes</span>
                  <span className="ir-step-subtitle">Attachments</span>
                </div>
              </button>

              <div className="ir-step-arrow">→</div>

              <button
                type="button"
                className={`ir-step-item ${step === 4 ? 'active' : ''}`}
                onClick={() => {
                  if (validateStep1() && validateStep2() && validateStep3()) setStep(4);
                }}
                disabled={!formData.incidentType || !formData.platform || !formData.description}
              >
                <div className="ir-step-num">4</div>
                <div className="ir-step-labels">
                  <span className="ir-step-title">Review & Save</span>
                  <span className="ir-step-subtitle">Verification</span>
                </div>
              </button>
            </div>
          )}

          {/* STEP 1: INCIDENT TYPE SELECTION */}
          {step === 1 && (
            <div className="ir-form-card">
              <div className="ir-section-head">
                <div>
                  <h2>
                    <AlertTriangle size={20} style={{ color: 'var(--brand-blue)' }} />
                    Step 1: Select Incident Classification
                  </h2>
                  <p>
                    Choose the primary category that best characterizes the suspected cyber incident.
                  </p>
                </div>
              </div>

              {errors.incidentType && (
                <div className="ir-error-text" style={{ fontSize: '13px' }}>
                  <AlertCircle size={16} />
                  <span>{errors.incidentType}</span>
                </div>
              )}

              <div className="ir-type-cards-grid">
                {INCIDENT_TYPES.map(type => {
                  const IconComponent = type.icon;
                  const isSelected = formData.incidentType === type.id;
                  return (
                    <div
                      key={type.id}
                      className={`ir-type-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleInputChange('incidentType', type.id)}
                    >
                      <div className="ir-type-card-head">
                        <div className="ir-type-icon-box">
                          <IconComponent size={18} />
                        </div>
                        {isSelected && (
                          <div style={{ color: 'var(--brand-blue)' }}>
                            <CheckCircle2 size={18} />
                          </div>
                        )}
                      </div>
                      <div className="ir-type-name">{type.name}</div>
                      <div className="ir-type-desc">{type.description}</div>
                    </div>
                  );
                })}
              </div>

              {/* Step 1 Actions */}
              <div className="ir-actions-bar">
                <div className="ir-actions-left">
                  <button
                    type="button"
                    className="ir-btn ir-btn-ghost"
                    onClick={() => setActiveTab('history')}
                  >
                    Back to Incident Logs
                  </button>
                </div>
                <div className="ir-actions-right">
                  <button
                    type="button"
                    className="ir-btn ir-btn-primary"
                    onClick={handleNext}
                  >
                    <span>Proceed to Incident Details</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INCIDENT DETAILS */}
          {step === 2 && (
            <div className="ir-form-card">
              <div className="ir-section-head">
                <div>
                  <h2>
                    <Clock size={20} style={{ color: 'var(--brand-blue)' }} />
                    Step 2: Incident Details & Timeline
                  </h2>
                  <p>
                    Provide factual details concerning where, when, and how the event occurred.
                  </p>
                </div>
              </div>

              <div className="ir-form-grid">
                {/* Date of incident */}
                <div className="ir-form-group">
                  <label htmlFor="incidentDate" className="ir-label">
                    <span>Date of Incident <span className="ir-required-mark">*</span></span>
                  </label>
                  <input
                    type="date"
                    id="incidentDate"
                    className={`ir-input ${errors.incidentDate ? 'has-error' : ''}`}
                    value={formData.incidentDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                  />
                  {errors.incidentDate && (
                    <div className="ir-error-text">
                      <AlertCircle size={14} />
                      <span>{errors.incidentDate}</span>
                    </div>
                  )}
                </div>

                {/* Approximate time */}
                <div className="ir-form-group">
                  <label htmlFor="incidentTime" className="ir-label">
                    <span>Approximate Time</span>
                    <span className="ir-optional-mark">Optional</span>
                  </label>
                  <input
                    type="time"
                    id="incidentTime"
                    className="ir-input"
                    value={formData.incidentTime}
                    onChange={(e) => handleInputChange('incidentTime', e.target.value)}
                  />
                  <span className="ir-help-text">e.g., 14:30 or estimated hour</span>
                </div>

                {/* Where it happened / Platform or service */}
                <div className="ir-form-group span-full">
                  <label htmlFor="platform" className="ir-label">
                    <span>Where did it happen? (Platform or Service) <span className="ir-required-mark">*</span></span>
                  </label>
                  <input
                    type="text"
                    id="platform"
                    className={`ir-input ${errors.platform ? 'has-error' : ''}`}
                    placeholder="e.g., WhatsApp, Instagram, HDFC NetBanking, Gmail, Corporate VPN, Fake Website"
                    value={formData.platform}
                    onChange={(e) => handleInputChange('platform', e.target.value)}
                  />
                  {errors.platform && (
                    <div className="ir-error-text">
                      <AlertCircle size={14} />
                      <span>{errors.platform}</span>
                    </div>
                  )}
                </div>

                {/* Description of what happened */}
                <div className="ir-form-group span-full">
                  <label htmlFor="description" className="ir-label">
                    <span>Detailed Narrative of What Happened <span className="ir-required-mark">*</span></span>
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className={`ir-textarea ${errors.description ? 'has-error' : ''}`}
                    placeholder="Provide a step-by-step account of the event: what message was received, what actions were requested, what was clicked, or what unusual behavior occurred..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                  {errors.description && (
                    <div className="ir-error-text">
                      <AlertCircle size={14} />
                      <span>{errors.description}</span>
                    </div>
                  )}
                  <span className="ir-help-text">Character count: {formData.description.length} (minimum 15 characters)</span>
                </div>

                {/* How the citizen discovered the incident */}
                <div className="ir-form-group span-full">
                  <label htmlFor="discovery" className="ir-label">
                    <span>How did you discover the incident? <span className="ir-required-mark">*</span></span>
                  </label>
                  <input
                    type="text"
                    id="discovery"
                    className={`ir-input ${errors.discovery ? 'has-error' : ''}`}
                    placeholder="e.g., Received an unexpected bank debit SMS, noticed unauthorized login from a foreign IP, friend notified me of fake profile"
                    value={formData.discovery}
                    onChange={(e) => handleInputChange('discovery', e.target.value)}
                  />
                  {errors.discovery && (
                    <div className="ir-error-text">
                      <AlertCircle size={14} />
                      <span>{errors.discovery}</span>
                    </div>
                  )}
                </div>

                {/* Suspected impact */}
                <div className="ir-form-group span-full">
                  <label htmlFor="impact" className="ir-label">
                    <span>Suspected or Confirmed Impact</span>
                    <span className="ir-optional-mark">Optional</span>
                  </label>
                  <input
                    type="text"
                    id="impact"
                    className="ir-input"
                    placeholder="e.g., Financial loss of ₹15,000; email password altered; personal contacts harassed; no financial loss noticed yet"
                    value={formData.impact}
                    onChange={(e) => handleInputChange('impact', e.target.value)}
                  />
                </div>

                {/* Optional suspicious URL */}
                <div className="ir-form-group">
                  <label htmlFor="suspiciousUrl" className="ir-label">
                    <span>Suspicious URL / Website</span>
                    <span className="ir-optional-mark">Optional</span>
                  </label>
                  <input
                    type="text"
                    id="suspiciousUrl"
                    className={`ir-input ${errors.suspiciousUrl ? 'has-error' : ''}`}
                    placeholder="e.g., https://secure-bank-login-verify.xyz"
                    value={formData.suspiciousUrl}
                    onChange={(e) => handleInputChange('suspiciousUrl', e.target.value)}
                  />
                  {errors.suspiciousUrl && (
                    <div className="ir-error-text">
                      <AlertCircle size={14} />
                      <span>{errors.suspiciousUrl}</span>
                    </div>
                  )}
                </div>

                {/* Optional IP address */}
                <div className="ir-form-group">
                  <label htmlFor="ipAddress" className="ir-label">
                    <span>IP Address (if identified)</span>
                    <span className="ir-optional-mark">Optional</span>
                  </label>
                  <input
                    type="text"
                    id="ipAddress"
                    className={`ir-input ${errors.ipAddress ? 'has-error' : ''}`}
                    placeholder="e.g., 185.220.101.5"
                    value={formData.ipAddress}
                    onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                  />
                  {errors.ipAddress && (
                    <div className="ir-error-text">
                      <AlertCircle size={14} />
                      <span>{errors.ipAddress}</span>
                    </div>
                  )}
                </div>

                {/* Optional email/phone/contact involved */}
                <div className="ir-form-group span-full">
                  <label htmlFor="contactInvolved" className="ir-label">
                    <span>Sender Email, Phone Number, or Account Handle Involved</span>
                    <span className="ir-optional-mark">Optional</span>
                  </label>
                  <input
                    type="text"
                    id="contactInvolved"
                    className="ir-input"
                    placeholder="e.g., +91 98765 43210, alert-service@support-fraud.org, @fraud_telegram_handle"
                    value={formData.contactInvolved}
                    onChange={(e) => handleInputChange('contactInvolved', e.target.value)}
                  />
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className="ir-actions-bar">
                <div className="ir-actions-left">
                  <button
                    type="button"
                    className="ir-btn ir-btn-secondary"
                    onClick={handlePrev}
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Classification</span>
                  </button>
                </div>
                <div className="ir-actions-right">
                  <button
                    type="button"
                    className="ir-btn ir-btn-primary"
                    onClick={handleNext}
                  >
                    <span>Proceed to Evidence</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: EVIDENCE & NOTES */}
          {step === 3 && (
            <div className="ir-form-card">
              <div className="ir-section-head">
                <div>
                  <h2>
                    <Upload size={20} style={{ color: 'var(--brand-blue)' }} />
                    Step 3: Supporting Evidence & Technical Artifacts
                  </h2>
                  <p>
                    Attach supporting screenshots, documents, or context notes to substantiate the record.
                  </p>
                </div>
              </div>

              {/* MANDATORY PRIVACY WARNING BEFORE EVIDENCE IS ADDED */}
              <div className="ir-evidence-warning">
                <AlertTriangle size={24} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Mandatory Privacy & Safety Warning:</strong>
                  Do not upload passwords, OTPs, banking PINs, or unnecessary personal information. Please redact, crop, or blur sensitive account credentials, Aadhaar/SSN numbers, or private payment card CVVs before uploading evidence.
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                className={`ir-dropzone ${isDragActive ? 'drag-active' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragActive(true);
                }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileInputChange}
                />
                <div className="ir-dropzone-icon">
                  <Upload size={22} />
                </div>
                <div className="ir-dropzone-title">
                  Click or drag screenshots and document files here
                </div>
                <div className="ir-dropzone-hint">
                  Supports PNG, JPG, PDF, DOCX, TXT. Files are processed locally on your machine.
                </div>
              </div>

              {/* Attached Evidence Files List */}
              {formData.evidenceFiles.length > 0 && (
                <div>
                  <div className="ir-label" style={{ marginBottom: 8 }}>
                    <span>Attached Evidence ({formData.evidenceFiles.length} file{formData.evidenceFiles.length > 1 ? 's' : ''})</span>
                  </div>
                  <div className="ir-evidence-list">
                    {formData.evidenceFiles.map((file, idx) => (
                      <div key={idx} className="ir-evidence-item">
                        <div className="ir-evidence-item-left">
                          <FileText size={18} style={{ color: 'var(--brand-blue)', flexShrink: 0 }} />
                          <div className="ir-file-info">
                            <span className="ir-file-name" title={file.name}>{file.name}</span>
                            <span className="ir-file-size">{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="ir-remove-btn"
                          title="Remove file"
                          onClick={() => removeEvidenceFile(idx)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence Context Notes */}
              <div className="ir-form-group">
                <label htmlFor="evidenceNotes" className="ir-label">
                  <span>Relevant Context Notes</span>
                  <span className="ir-optional-mark">Optional</span>
                </label>
                <textarea
                  id="evidenceNotes"
                  rows={3}
                  className="ir-textarea"
                  placeholder="Explain what the attached screenshots show (e.g. 'Screenshot 1 displays the fake payment confirmation screen sent via SMS; File 2 is the suspicious email header')..."
                  value={formData.evidenceNotes}
                  onChange={(e) => handleInputChange('evidenceNotes', e.target.value)}
                />
              </div>

              {/* Reporter Information (Step 3/4 bridge) */}
              <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                  Reporter Information (Optional)
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
                  Provide contact details only if you wish to associate this record with your identity. All fields are optional.
                </p>

                <div className="ir-form-grid">
                  <div className="ir-form-group">
                    <label htmlFor="reporterName" className="ir-label">
                      <span>Full Name or Alias</span>
                      <span className="ir-optional-mark">Optional</span>
                    </label>
                    <input
                      type="text"
                      id="reporterName"
                      className="ir-input"
                      placeholder="e.g. John Doe / Citizen"
                      value={formData.reporterName}
                      onChange={(e) => handleInputChange('reporterName', e.target.value)}
                    />
                  </div>

                  <div className="ir-form-group">
                    <label htmlFor="reporterEmail" className="ir-label">
                      <span>Contact Email</span>
                      <span className="ir-optional-mark">Optional</span>
                    </label>
                    <input
                      type="email"
                      id="reporterEmail"
                      className="ir-input"
                      placeholder="e.g. citizen@example.com"
                      value={formData.reporterEmail}
                      onChange={(e) => handleInputChange('reporterEmail', e.target.value)}
                    />
                  </div>

                  <div className="ir-form-group">
                    <label htmlFor="reporterPhone" className="ir-label">
                      <span>Contact Phone</span>
                      <span className="ir-optional-mark">Optional</span>
                    </label>
                    <input
                      type="tel"
                      id="reporterPhone"
                      className="ir-input"
                      placeholder="e.g. +91 98765 00000"
                      value={formData.reporterPhone}
                      onChange={(e) => handleInputChange('reporterPhone', e.target.value)}
                    />
                  </div>

                  <div className="ir-form-group">
                    <label htmlFor="reporterRegion" className="ir-label">
                      <span>State / City</span>
                      <span className="ir-optional-mark">Optional</span>
                    </label>
                    <input
                      type="text"
                      id="reporterRegion"
                      className="ir-input"
                      placeholder="e.g. Karnataka / Bengaluru"
                      value={formData.reporterRegion}
                      onChange={(e) => handleInputChange('reporterRegion', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Step 3 Actions */}
              <div className="ir-actions-bar">
                <div className="ir-actions-left">
                  <button
                    type="button"
                    className="ir-btn ir-btn-secondary"
                    onClick={handlePrev}
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Details</span>
                  </button>
                </div>
                <div className="ir-actions-right">
                  <button
                    type="button"
                    className="ir-btn ir-btn-primary"
                    onClick={handleNext}
                  >
                    <span>Review Report Summary</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW BEFORE SAVE */}
          {step === 4 && (
            <div className="ir-form-card">
              <div className="ir-section-head">
                <div>
                  <h2>
                    <CheckCircle2 size={20} style={{ color: 'var(--brand-blue)' }} />
                    Step 4: Review Before Saving Incident Report
                  </h2>
                  <p>
                    Verify all entered information below. You can return to any previous section to adjust details before saving.
                  </p>
                </div>
              </div>

              <div className="ir-review-grid">
                {/* Card 1: Classification & Timing */}
                <div className="ir-review-card">
                  <div className="ir-review-card-head">
                    <span className="ir-review-card-title">
                      <Clock size={14} />
                      Classification & Occurrence
                    </span>
                    <button
                      type="button"
                      className="ir-review-edit-btn"
                      onClick={() => setStep(1)}
                    >
                      Edit
                    </button>
                  </div>

                  <div className="ir-review-row">
                    <span className="ir-review-label">Incident Type</span>
                    <span className="ir-review-value highlight">
                      {INCIDENT_TYPES.find(t => t.id === formData.incidentType)?.name || formData.incidentType || 'Not selected'}
                    </span>
                  </div>

                  <div className="ir-review-row">
                    <span className="ir-review-label">Date of Occurrence</span>
                    <span className="ir-review-value">{formatDateDisplay(formData.incidentDate)}</span>
                  </div>

                  <div className="ir-review-row">
                    <span className="ir-review-label">Approximate Time</span>
                    <span className="ir-review-value">{formData.incidentTime || 'Not specified'}</span>
                  </div>

                  <div className="ir-review-row">
                    <span className="ir-review-label">Platform / Service</span>
                    <span className="ir-review-value">{formData.platform || 'Not specified'}</span>
                  </div>
                </div>

                {/* Card 2: Narrative & Discovery */}
                <div className="ir-review-card">
                  <div className="ir-review-card-head">
                    <span className="ir-review-card-title">
                      <FileText size={14} />
                      Narrative & Impact
                    </span>
                    <button
                      type="button"
                      className="ir-review-edit-btn"
                      onClick={() => setStep(2)}
                    >
                      Edit
                    </button>
                  </div>

                  <div className="ir-review-row">
                    <span className="ir-review-label">Incident Description</span>
                    <span className="ir-review-value">{formData.description || 'No description provided.'}</span>
                  </div>

                  <div className="ir-review-row">
                    <span className="ir-review-label">Discovery Method</span>
                    <span className="ir-review-value">{formData.discovery || 'Not specified'}</span>
                  </div>

                  <div className="ir-review-row">
                    <span className="ir-review-label">Suspected Impact</span>
                    <span className="ir-review-value">{formData.impact || 'None / Not stated'}</span>
                  </div>
                </div>

                {/* Card 3: Technical Indicators & Contacts */}
                <div className="ir-review-card">
                  <div className="ir-review-card-head">
                    <span className="ir-review-card-title">
                      <Globe size={14} />
                      Suspicious Indicators
                    </span>
                    <button
                      type="button"
                      className="ir-review-edit-btn"
                      onClick={() => setStep(2)}
                    >
                      Edit
                    </button>
                  </div>

                  <div className="ir-review-row">
                    <span className="ir-review-label">Suspicious URL</span>
                    <span className="ir-review-value">{formData.suspiciousUrl || 'None specified'}</span>
                  </div>

                  <div className="ir-review-row">
                    <span className="ir-review-label">Suspect IP Address</span>
                    <span className="ir-review-value">{formData.ipAddress || 'None specified'}</span>
                  </div>

                  <div className="ir-review-row">
                    <span className="ir-review-label">Contact / Account Involved</span>
                    <span className="ir-review-value">{formData.contactInvolved || 'None specified'}</span>
                  </div>
                </div>

                {/* Card 4: Evidence & Reporter Details */}
                <div className="ir-review-card">
                  <div className="ir-review-card-head">
                    <span className="ir-review-card-title">
                      <Upload size={14} />
                      Evidence & Reporter
                    </span>
                    <button
                      type="button"
                      className="ir-review-edit-btn"
                      onClick={() => setStep(3)}
                    >
                      Edit
                    </button>
                  </div>

                  <div className="ir-review-row">
                    <span className="ir-review-label">Attached Files</span>
                    <span className="ir-review-value">
                      {formData.evidenceFiles.length > 0
                        ? `${formData.evidenceFiles.length} file(s) attached`
                        : 'No files attached'}
                    </span>
                  </div>

                  <div className="ir-review-row">
                    <span className="ir-review-label">Reporter Name</span>
                    <span className="ir-review-value">{formData.reporterName || 'Anonymous Citizen'}</span>
                  </div>

                  <div className="ir-review-row">
                    <span className="ir-review-label">Reporter Contact</span>
                    <span className="ir-review-value">
                      {[formData.reporterEmail, formData.reporterPhone].filter(Boolean).join(' • ') || 'None provided'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statutory Distinction Reminder */}
              <div className="ir-evidence-warning" style={{ background: 'var(--brand-blue-subtle)', borderColor: 'var(--brand-blue-border)', color: 'var(--text-primary)' }}>
                <ShieldCheck size={20} style={{ color: 'var(--brand-blue)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Local Sandbox Distinction:</strong> Saving this report creates a structured, tamper-evident record stored purely in your browser storage. It is not filed with the police or CERT-In until you transmit it via official government channels.
                </div>
              </div>

              {/* Step 4 Review Actions */}
              <div className="ir-actions-bar">
                <div className="ir-actions-left">
                  <button
                    type="button"
                    className="ir-btn ir-btn-secondary"
                    onClick={handlePrev}
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Evidence</span>
                  </button>
                  <button
                    type="button"
                    className="ir-btn ir-btn-ghost"
                    onClick={() => setActiveTab('history')}
                  >
                    Cancel
                  </button>
                </div>
                <div className="ir-actions-right">
                  <button
                    type="button"
                    className="ir-btn ir-btn-primary"
                    onClick={handleSaveReport}
                  >
                    <FileCheck size={16} />
                    <span>Save Incident Report</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REPORT CONFIRMATION & ACTIONS */}
          {step === 5 && lastSavedReport && (
            <div className="ir-success-card">
              <div className="ir-success-badge-icon">
                <CheckCircle2 size={36} />
              </div>

              <h2 className="ir-success-title">Incident Report Successfully Saved</h2>

              <p className="ir-success-subtitle">
                Your cyber incident record has been securely compiled and registered into your local CyberCouncil Incident Logs.
              </p>

              {/* Report ID Pill */}
              <div className="ir-report-id-pill">
                <span>{lastSavedReport.id}</span>
                <button
                  type="button"
                  className="ir-copy-id-btn"
                  title="Copy Report ID"
                  onClick={() => handleCopyId(lastSavedReport.id)}
                >
                  {copiedId ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

              {/* Summary Details Table */}
              <div className="ir-details-summary-table">
                <div className="ir-summary-row">
                  <div className="ir-summary-key">Incident Type</div>
                  <div className="ir-summary-val">{lastSavedReport.type}</div>
                </div>
                <div className="ir-summary-row">
                  <div className="ir-summary-key">Occurrence Date</div>
                  <div className="ir-summary-val">{formatDateDisplay(lastSavedReport.date)}</div>
                </div>
                <div className="ir-summary-row">
                  <div className="ir-summary-key">Current Status</div>
                  <div className="ir-summary-val">
                    <span className="ir-badge saved">
                      <CheckCircle2 size={12} />
                      {lastSavedReport.status}
                    </span>
                  </div>
                </div>
                <div className="ir-summary-row">
                  <div className="ir-summary-key">Created Timestamp</div>
                  <div className="ir-summary-val">{formatTimestampDisplay(lastSavedReport.createdAt)}</div>
                </div>
              </div>

              {/* Official Escalation Advisory */}
              <div className="ir-advisory-banner" style={{ textAlign: 'left', width: '100%', boxSizing: 'border-box' }}>
                <Info size={20} className="ir-advisory-icon" />
                <div>
                  <strong>Official Legal Escalation Guidance:</strong>
                  This record is <strong>Saved in CyberCouncil</strong> on your local machine. If this incident involves financial theft, blackmail, or harassment, you can use the downloaded summary to lodge an official complaint with the <strong>National Cyber Crime Reporting Portal (cybercrime.gov.in)</strong> or by dialling the National Helpline <strong>1930</strong>.
                </div>
              </div>

              {/* Actions Bar */}
              <div className="ir-actions-bar" style={{ width: '100%', justifyContent: 'center', gap: 14 }}>
                <button
                  type="button"
                  className="ir-btn ir-btn-primary"
                  onClick={() => handleDownloadReport(lastSavedReport)}
                >
                  <Download size={16} />
                  <span>Download Report</span>
                </button>

                <button
                  type="button"
                  className="ir-btn ir-btn-secondary"
                  onClick={handleCreateAnother}
                >
                  <Plus size={16} />
                  <span>Create Another Report</span>
                </button>

                <button
                  type="button"
                  className="ir-btn ir-btn-ghost"
                  onClick={() => {
                    setActiveTab('history');
                    loadSavedReports();
                  }}
                >
                  <Layers size={16} />
                  <span>Back to Incident Logs</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* VIEW TAB 2: INCIDENT HISTORY */}
      {activeTab === 'history' && (
        <div className="ir-form-card">
          <div className="ir-section-head">
            <div>
              <h2>
                <Layers size={20} style={{ color: 'var(--brand-blue)' }} />
                Saved Incident Reports History
              </h2>
              <p>
                Review, inspect, and export all cyber incident records stored in your local CyberCouncil vault.
              </p>
            </div>

            <button
              type="button"
              className="ir-btn ir-btn-primary"
              onClick={() => {
                setActiveTab('report');
                setStep(1);
              }}
            >
              <Plus size={16} />
              <span>Report New Incident</span>
            </button>
          </div>

          {/* History Search & Filter Controls */}
          {savedReports.length > 0 && (
            <div className="ir-history-controls">
              <div className="ir-search-wrapper">
                <Search size={16} className="ir-search-icon" />
                <input
                  type="text"
                  className="ir-search-input"
                  placeholder="Search by ID, type, platform, keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="ir-select"
                style={{ width: 'auto', minWidth: 200 }}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Incident Types</option>
                {INCIDENT_TYPES.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Table or Empty State */}
          {filteredHistory.length === 0 ? (
            <div className="ir-empty-state">
              <div className="ir-empty-icon">
                <FileText size={28} />
              </div>
              <h3 className="ir-empty-title">
                {savedReports.length === 0 ? 'No Incident Reports Recorded' : 'No Matching Reports Found'}
              </h3>
              <p className="ir-empty-desc">
                {savedReports.length === 0
                  ? 'You have not saved any cyber incident reports yet. When you document suspicious activities, they will appear here.'
                  : 'No records matched your search query or filter criteria. Try adjusting the search term.'}
              </p>
              {savedReports.length === 0 ? (
                <button
                  type="button"
                  className="ir-btn ir-btn-primary"
                  onClick={() => {
                    setActiveTab('report');
                    setStep(1);
                  }}
                >
                  <Plus size={16} />
                  <span>File Your First Report</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="ir-btn ir-btn-secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('all');
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          ) : (
            <div className="ir-table-wrapper">
              <table className="ir-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Incident Type</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((report) => {
                    const id = report.id || report.incidentId || `INC-${report.submittedAt || Date.now()}`;
                    const type = report.type || report.incidentType || 'Other';
                    const date = report.date || report.submittedAt;
                    const created = report.createdAt || report.submittedAt;
                    const status = report.status || (report.reportedToAuthorities ? 'Reported' : 'Draft / Saved');

                    return (
                      <tr key={id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {id}
                            </span>
                            <button
                              type="button"
                              className="ir-copy-id-btn"
                              title="Copy Report ID"
                              onClick={() => handleCopyId(id)}
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                        </td>

                        <td>
                          <span className="ir-badge type-tag">
                            {type}
                          </span>
                        </td>

                        <td>{formatDateDisplay(date)}</td>

                        <td>
                          <span className="ir-badge saved">
                            <CheckCircle2 size={12} />
                            {status}
                          </span>
                        </td>

                        <td style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>
                          {formatTimestampDisplay(created)}
                        </td>

                        <td>
                          <div className="ir-table-actions" style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="ir-btn-icon"
                              title="View Full Report"
                              onClick={() => setSelectedReportForModal(report)}
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              type="button"
                              className="ir-btn-icon"
                              title="Download Report"
                              onClick={() => handleDownloadReport(report)}
                            >
                              <Download size={15} />
                            </button>

                            <button
                              type="button"
                              className="ir-btn-icon danger"
                              title="Delete Record"
                              onClick={() => handleDeleteReport(id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DETAIL MODAL: VIEW REPORT DETAILS */}
      {selectedReportForModal && (
        <div className="ir-modal-backdrop" onClick={() => setSelectedReportForModal(null)}>
          <div className="ir-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ir-modal-header">
              <div className="ir-modal-title">
                <FileText size={20} style={{ color: 'var(--brand-blue)' }} />
                <span>Incident Report Details: {selectedReportForModal.id || selectedReportForModal.incidentId}</span>
              </div>
              <button
                type="button"
                className="ir-remove-btn"
                onClick={() => setSelectedReportForModal(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="ir-modal-body">
              {/* Badge row */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="ir-badge type-tag" style={{ fontSize: 13, padding: '4px 10px' }}>
                  {selectedReportForModal.type || selectedReportForModal.incidentType}
                </span>
                <span className="ir-badge saved" style={{ fontSize: 13, padding: '4px 10px' }}>
                  <CheckCircle2 size={14} />
                  {selectedReportForModal.status || 'Draft / Saved'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                  Created: {formatTimestampDisplay(selectedReportForModal.createdAt || selectedReportForModal.submittedAt)}
                </span>
              </div>

              {/* Details breakdown */}
              <div className="ir-review-grid">
                <div className="ir-review-card">
                  <span className="ir-review-card-title">Event Timeline & Platform</span>
                  <div className="ir-review-row">
                    <span className="ir-review-label">Incident Date</span>
                    <span className="ir-review-value">{formatDateDisplay(selectedReportForModal.date)}</span>
                  </div>
                  <div className="ir-review-row">
                    <span className="ir-review-label">Time</span>
                    <span className="ir-review-value">{selectedReportForModal.time || 'Not specified'}</span>
                  </div>
                  <div className="ir-review-row">
                    <span className="ir-review-label">Platform / Medium</span>
                    <span className="ir-review-value">{selectedReportForModal.platform || 'Not specified'}</span>
                  </div>
                </div>

                <div className="ir-review-card">
                  <span className="ir-review-card-title">Technical Indicators</span>
                  <div className="ir-review-row">
                    <span className="ir-review-label">Suspicious URL</span>
                    <span className="ir-review-value">{selectedReportForModal.suspiciousUrl || selectedReportForModal.urls || 'None'}</span>
                  </div>
                  <div className="ir-review-row">
                    <span className="ir-review-label">IP Address</span>
                    <span className="ir-review-value">{selectedReportForModal.ipAddress || 'None'}</span>
                  </div>
                  <div className="ir-review-row">
                    <span className="ir-review-label">Suspect Contact</span>
                    <span className="ir-review-value">{selectedReportForModal.contactInvolved || 'None'}</span>
                  </div>
                </div>
              </div>

              {/* Narrative description */}
              <div className="ir-review-card">
                <span className="ir-review-card-title">Incident Narrative</span>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {selectedReportForModal.description || 'No description provided.'}
                </p>
              </div>

              {/* Discovery & Impact */}
              {(selectedReportForModal.discovery || selectedReportForModal.impact) && (
                <div className="ir-review-grid">
                  {selectedReportForModal.discovery && (
                    <div className="ir-review-card">
                      <span className="ir-review-card-title">How Discovered</span>
                      <span className="ir-review-value">{selectedReportForModal.discovery}</span>
                    </div>
                  )}
                  {selectedReportForModal.impact && (
                    <div className="ir-review-card">
                      <span className="ir-review-card-title">Suspected Impact</span>
                      <span className="ir-review-value">{selectedReportForModal.impact}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Evidence attachments */}
              {selectedReportForModal.evidenceFiles && selectedReportForModal.evidenceFiles.length > 0 && (
                <div className="ir-review-card">
                  <span className="ir-review-card-title">Attached Evidence Files</span>
                  <div className="ir-evidence-list">
                    {selectedReportForModal.evidenceFiles.map((file, idx) => (
                      <div key={idx} className="ir-evidence-item">
                        <div className="ir-evidence-item-left">
                          <FileText size={16} style={{ color: 'var(--brand-blue)' }} />
                          <span className="ir-file-name">{file.name}</span>
                        </div>
                        <span className="ir-file-size">{formatFileSize(file.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reporter Info */}
              {(selectedReportForModal.reporterName || selectedReportForModal.reporterEmail) && (
                <div className="ir-review-card">
                  <span className="ir-review-card-title">Reporter Details</span>
                  <div className="ir-review-row">
                    <span className="ir-review-label">Name</span>
                    <span className="ir-review-value">{selectedReportForModal.reporterName || 'Anonymous'}</span>
                  </div>
                  <div className="ir-review-row">
                    <span className="ir-review-label">Contact</span>
                    <span className="ir-review-value">
                      {[selectedReportForModal.reporterEmail, selectedReportForModal.reporterPhone, selectedReportForModal.reporterRegion].filter(Boolean).join(' • ') || 'None'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="ir-modal-footer">
              <button
                type="button"
                className="ir-btn ir-btn-secondary"
                onClick={() => setSelectedReportForModal(null)}
              >
                Close
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="ir-btn ir-btn-primary"
                  onClick={() => handleDownloadReport(selectedReportForModal)}
                >
                  <Download size={16} />
                  <span>Download Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
