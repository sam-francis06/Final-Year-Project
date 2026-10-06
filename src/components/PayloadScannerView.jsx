import React, { useState, useRef } from 'react';
import {
  FileWarning,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  HelpCircle,
  ArrowLeft,
  UploadCloud,
  FileText,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Lock,
  Cpu,
  RefreshCw,
  Search
} from 'lucide-react';

const SUPPORTED_EXTENSIONS = [
  '.exe', '.dll', '.msi', '.apk', '.jar', '.zip', '.rar',
  '.doc', '.docx', '.xls', '.xlsx', '.pdf', '.js', '.ps1', '.bat', '.cmd', '.scr'
];

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function PayloadScannerView({ onBack }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [sha256Hash, setSha256Hash] = useState('');
  // States: 'idle' | 'hashing' | 'ready' | 'uploading' | 'analyzing' | 'complete' | 'error'
  const [scannerState, setScannerState] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  const handleReset = () => {
    setSelectedFile(null);
    setSha256Hash('');
    setResult(null);
    setErrorMessage('');
    setScannerState('idle');
    setStatusMessage('');
    setShowTechnicalDetails(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyHash = () => {
    if (!sha256Hash) return;
    navigator.clipboard.writeText(sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyReport = () => {
    if (!result) return;
    const summary = `CyberCouncil Malware Scanner Report
File: ${result.file?.name || selectedFile?.name || 'Unknown'}
SHA-256: ${result.file?.sha256 || sha256Hash || 'N/A'}
Verdict: ${result.verdict}
Risk Level: ${result.riskLevel || 'Unknown'}
Summary: ${result.message}
Detection Stats: ${result.stats?.malicious ?? 0} malicious, ${result.stats?.suspicious ?? 0} suspicious, ${result.stats?.harmless ?? 0} harmless, ${result.stats?.undetected ?? 0} undetected
Timestamp: ${result.analysis?.timestamp || result.scanTimestamp || new Date().toISOString()}`;

    navigator.clipboard.writeText(summary);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // Perform automatic malware scanning via VirusTotal v3 backend
  const performScan = async (fileToScan, hashValue) => {
    const targetFile = fileToScan || selectedFile;
    if (!targetFile) return;

    setErrorMessage('');
    setResult(null);
    setScannerState('uploading');
    setStatusMessage('Uploading file to VirusTotal...');

    const timer1 = setTimeout(() => {
      setScannerState('analyzing');
      setStatusMessage('VirusTotal is analyzing the file across security engines...');
    }, 2000);

    const timer2 = setTimeout(() => {
      setStatusMessage('Preparing malware scan results...');
    }, 6000);

    try {
      const formData = new FormData();
      formData.append('file', targetFile);

      const response = await fetch('/api/scan-file', {
        method: 'POST',
        body: formData
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await response.json();

      if (!response.ok || !data.success) {
        setResult({
          verdict: 'Verification Unavailable',
          riskLevel: 'Unknown',
          message: data.message || 'Verification could not be completed for the uploaded file.',
          guidance: data.guidance || 'Threat intelligence verification could not be completed at this time.',
          disclaimer: null,
          stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 },
          detections: [],
          flaggedEngines: [],
          file: {
            name: targetFile.name,
            size: targetFile.size,
            mimeType: targetFile.type || 'Unknown / Binary',
            sha256: hashValue || sha256Hash,
            sha1: '',
            md5: ''
          },
          analysis: {
            status: 'failed',
            timestamp: new Date().toISOString()
          },
          source: 'VirusTotal v3'
        });
        setScannerState('complete');
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return;
      }

      setResult(data);
      setScannerState('complete');
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setErrorMessage('Network connection failure while transmitting file for VirusTotal analysis.');
      setScannerState('error');
    }
  };

  // Step 1: User Selects File -> Calculate SHA-256 -> AUTOMATICALLY execute malware scan
  const handleFileSelect = async (file) => {
    if (!file) return;

    setErrorMessage('');
    setResult(null);
    setShowTechnicalDetails(false);

    // Validate size limit (100 MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage('File exceeds the 100 MB upload limit.');
      setSelectedFile(null);
      setSha256Hash('');
      setScannerState('error');
      return;
    }

    setSelectedFile(file);
    setScannerState('hashing');
    setStatusMessage('Calculating SHA-256 in browser...');

    let calculatedHash = '';
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      calculatedHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setSha256Hash(calculatedHash);
    } catch {
      calculatedHash = 'Calculation failed';
      setSha256Hash(calculatedHash);
    }

    // Automatically submit to VirusTotal scan workflow without stopping
    await performScan(file, calculatedHash);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const getRiskTheme = (riskLevel, verdict) => {
    const isHigh = riskLevel === 'High Risk' || verdict === 'Unsafe / Malicious File';
    const isMed = riskLevel === 'Medium Risk' || verdict === 'Suspicious File';
    const isLow = riskLevel === 'Low Risk' || verdict === 'No Threat Detected';

    if (isHigh) {
      return {
        icon: <ShieldX size={36} />,
        badgeClass: 'verdict-badge-danger',
        boxClass: 'verdict-box-danger',
        accentColor: '#cf222e',
        riskLabel: 'HIGH RISK',
        verdictLabel: 'UNSAFE / MALICIOUS FILE'
      };
    }
    if (isMed) {
      return {
        icon: <AlertTriangle size={36} />,
        badgeClass: 'verdict-badge-amber',
        boxClass: 'verdict-box-amber',
        accentColor: 'var(--status-amber)',
        riskLabel: 'MEDIUM RISK',
        verdictLabel: 'SUSPICIOUS FILE'
      };
    }
    if (isLow) {
      return {
        icon: <ShieldCheck size={36} />,
        badgeClass: 'verdict-badge-safe',
        boxClass: 'verdict-box-safe',
        accentColor: 'var(--status-green)',
        riskLabel: 'LOW RISK',
        verdictLabel: 'NO THREAT DETECTED'
      };
    }
    return {
      icon: <HelpCircle size={36} />,
      badgeClass: 'verdict-badge-neutral',
      boxClass: 'verdict-box-neutral',
      accentColor: 'var(--text-secondary)',
      riskLabel: 'RISK UNKNOWN',
      verdictLabel: 'VERIFICATION UNAVAILABLE'
    };
  };

  const isScanningActive = scannerState === 'uploading' || scannerState === 'analyzing';

  return (
    <div className="payload-scanner-workspace">
      {/* Top Breadcrumb Navigation */}
      <div className="scanner-top-bar">
        <button
          type="button"
          onClick={onBack}
          className="back-to-modules-btn"
          aria-label="Back to Security Modules"
        >
          <ArrowLeft size={16} />
          <span>Back to Security Modules</span>
        </button>
        <span className="breadcrumb-separator">/</span>
        <span className="current-module-badge">Payload & Malware Scanner</span>
      </div>

      {/* Hero Header Card */}
      <section className="scanner-hero-card">
        <div className="scanner-hero-content">
          <div className="scanner-badge-row">
            <span className="scanner-title-pill">
              <FileWarning size={14} />
              <span>Digital Forensics</span>
            </span>
            <span className="scanner-version-pill">VirusTotal API v3 Engine</span>
          </div>

          <h1 className="scanner-title">Payload & Malware Scanner</h1>
          <p className="scanner-subtitle">
            Upload a suspicious file and check it for malware using VirusTotal multi-engine threat intelligence.
          </p>

          {/* Privacy & Safety Assurance Box */}
          <div className="privacy-assurance-box" role="status">
            <Lock size={18} className="privacy-icon" />
            <div className="privacy-text">
              <strong>Execution Sandbox Guarantee:</strong> Uploaded files are strictly analyzed for malware signatures. Files are <em>never executed, detonated, or extracted</em> by CyberCouncil.
            </div>
          </div>
        </div>
      </section>

      {/* File Upload & Inspection Workspace */}
      <section className="payload-scanner-card">
        {!selectedFile ? (
          <div
            className={`file-dropzone ${isDragOver ? 'dropzone-active' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              style={{ display: 'none' }}
              aria-label="Upload suspicious file"
            />
            <div className="dropzone-icon-box">
              <UploadCloud size={40} />
            </div>
            <h3 className="dropzone-title">Drop your suspicious file here, or click to browse</h3>
            <p className="dropzone-subtitle">
              Select any suspicious binary, script, or document to scan for malware
            </p>

            <div className="dropzone-tags-list">
              <span className="dropzone-tag-label">Supported Types:</span>
              {SUPPORTED_EXTENSIONS.map((ext) => (
                <span key={ext} className="file-type-pill">{ext}</span>
              ))}
            </div>

            <div className="dropzone-limit-note">
              Maximum upload size: <strong>100 MB</strong> (Zero-disk server storage guarantee)
            </div>
          </div>
        ) : (
          <div className="selected-file-container">
            <div className="selected-file-header">
              <div className="selected-file-meta-cluster">
                <div className="file-icon-box">
                  <FileText size={28} />
                </div>
                <div>
                  <h3 className="selected-filename">{selectedFile.name}</h3>
                  <div className="selected-file-details">
                    <span>Size: {formatBytes(selectedFile.size)}</span>
                    <span className="meta-separator">•</span>
                    <span>Type: {selectedFile.type || 'Unknown / Binary'}</span>
                    {isScanningActive ? (
                      <>
                        <span className="meta-separator">•</span>
                        <span style={{ color: 'var(--brand-accent)', fontWeight: 600 }}>{statusMessage}</span>
                      </>
                    ) : result ? (
                      <>
                        <span className="meta-separator">•</span>
                        <span style={{ color: 'var(--status-green)', fontWeight: 600 }}>Analysis Complete</span>
                      </>
                    ) : (
                      <>
                        <span className="meta-separator">•</span>
                        <span style={{ color: 'var(--status-green)', fontWeight: 600 }}>{statusMessage || 'File selected'}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {!isScanningActive && (
                  <button
                    type="button"
                    onClick={() => performScan(selectedFile, sha256Hash)}
                    className="btn-scan-file"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    <Search size={15} />
                    <span>{result ? 'Scan Again' : 'Scan for Malware'}</span>
                  </button>
                )}
                {!isScanningActive && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn-change-file"
                    title="Select another file"
                  >
                    <RotateCcw size={15} />
                    <span>Choose Another</span>
                  </button>
                )}
              </div>
            </div>

            {/* Informational SHA-256 Digest Card */}
            <div className="hash-preview-box">
              <div className="hash-header-row">
                <span className="hash-label">
                  <Cpu size={14} />
                  <span>Client-Side SHA-256 Digest:</span>
                </span>
                {sha256Hash && sha256Hash !== 'Calculation failed' && (
                  <button
                    type="button"
                    onClick={handleCopyHash}
                    className="btn-copy-hash"
                    title="Copy SHA-256 Hash"
                  >
                    {copiedHash ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                  </button>
                )}
              </div>
              <div className="hash-display-text">
                {scannerState === 'hashing' ? (
                  <span className="hashing-placeholder">Calculating SHA-256 in browser...</span>
                ) : (
                  <code>{sha256Hash || 'Calculation pending...'}</code>
                )}
              </div>
            </div>

            {/* Mandatory Privacy Advisory */}
            <div className="privacy-warning-callout">
              <AlertTriangle size={18} className="warning-icon" />
              <div className="warning-text">
                <strong>Submission Privacy Advisory:</strong> Do not upload confidential, private, financial, corporate, or personally sensitive files. Files submitted to VirusTotal may be processed according to VirusTotal's service terms.
              </div>
            </div>

            {/* Scan Progress Strip */}
            {isScanningActive && (
              <div className="scan-progress-strip">
                <RefreshCw size={20} className="spinner-icon" />
                <div className="progress-info">
                  <span className="progress-title">{statusMessage}</span>
                  <span className="progress-subtext">Uploading to VirusTotal and polling 70+ security vendors</span>
                </div>
              </div>
            )}

            {/* Primary Action Button: Scan for Malware */}
            {!isScanningActive && !result && (
              <div className="scanner-action-row" style={{ display: 'flex', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => performScan(selectedFile, sha256Hash)}
                  className="btn-scan-file"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  <Search size={18} />
                  <span>Scan for Malware</span>
                </button>
              </div>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="error-callout" role="alert">
            <AlertTriangle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}
      </section>

      {/* Results Section: Malware Risk & Detection Results */}
      {scannerState === 'complete' && result && (
        <section className="scan-results-container" ref={resultsRef}>
          {(() => {
            const theme = getRiskTheme(result.riskLevel, result.verdict);
            const isHigh = result.riskLevel === 'High Risk' || result.verdict === 'Unsafe / Malicious File';
            const isMed = result.riskLevel === 'Medium Risk' || result.verdict === 'Suspicious File';
            const isLow = result.riskLevel === 'Low Risk' || result.verdict === 'No Threat Detected';

            const maliciousCount = result.stats?.malicious ?? 0;
            const totalEngines = result.totalEngines || ((result.stats?.malicious || 0) + (result.stats?.suspicious || 0) + (result.stats?.harmless || 0) + (result.stats?.undetected || 0));

            // Dynamic citizen-friendly verdict explanation
            let verdictMessage = 'The malware verification could not be completed. Please try again later.';
            if (isHigh) {
              verdictMessage = `VirusTotal detected this file as malicious by ${maliciousCount} security engines.`;
            } else if (isMed) {
              verdictMessage = result.stats?.suspicious > 0 && maliciousCount > 0
                ? `VirusTotal flagged ${maliciousCount} malicious and ${result.stats.suspicious} suspicious detection(s).`
                : maliciousCount === 1
                ? 'VirusTotal detected this file as malicious by 1 security engine.'
                : `VirusTotal reported suspicious indicators for this file across ${result.stats?.suspicious || 1} security engine(s).`;
            } else if (isLow) {
              verdictMessage = totalEngines > 0
                ? `Analyzed across ${totalEngines} security engines: 0 threats detected.`
                : 'VirusTotal did not detect malicious indicators in the available security results.';
            }

            return (
              <div className={`verdict-box ${theme.boxClass}`}>
                <div className="verdict-top-row">
                  <div className="verdict-icon-group">
                    <div className="verdict-icon-badge" style={{ color: theme.accentColor }}>
                      {theme.icon}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span
                          className={`verdict-badge ${theme.badgeClass}`}
                          style={{
                            fontWeight: 800,
                            letterSpacing: '0.5px'
                          }}
                        >
                          {theme.riskLabel}
                        </span>
                        <span
                          className={`verdict-badge ${theme.badgeClass}`}
                          style={{ fontWeight: 600 }}
                        >
                          {theme.verdictLabel}
                        </span>
                      </div>

                      <h2 className="verdict-main-heading">{verdictMessage}</h2>

                      {isLow ? (
                        <p className="verdict-disclaimer-note">
                          <strong>Notice:</strong> Zero detections do not guarantee that a file is completely safe.
                        </p>
                      ) : result.disclaimer ? (
                        <p className="verdict-disclaimer-note">
                          <strong>Notice:</strong> {result.disclaimer}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="verdict-actions">
                    <button
                      type="button"
                      onClick={handleCopyReport}
                      className="btn-action-ghost"
                      title="Copy scan report"
                    >
                      {copiedReport ? <Check size={16} /> : <Copy size={16} />}
                      <span>{copiedReport ? 'Report Copied' : 'Copy Report'}</span>
                    </button>
                  </div>
                </div>

                {/* Detection Summary Section */}
                <div className="detection-summary-block" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-muted)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                    Detection Summary
                  </div>
                  <div className="stats-breakdown-row" style={{ borderTop: 'none', paddingTop: 0 }}>
                    <div className="stat-pill stat-malicious">
                      <span className="stat-pill-label">Malicious</span>
                      <span className="stat-pill-value">{result.stats?.malicious ?? 0}</span>
                    </div>
                    <div className="stat-pill stat-suspicious">
                      <span className="stat-pill-label">Suspicious</span>
                      <span className="stat-pill-value">{result.stats?.suspicious ?? 0}</span>
                    </div>
                    <div className="stat-pill stat-harmless">
                      <span className="stat-pill-label">Harmless</span>
                      <span className="stat-pill-value">{result.stats?.harmless ?? 0}</span>
                    </div>
                    <div className="stat-pill stat-undetected">
                      <span className="stat-pill-label">Undetected</span>
                      <span className="stat-pill-value">{result.stats?.undetected ?? 0}</span>
                    </div>
                    <div className="stat-pill stat-total">
                      <span className="stat-pill-label">Engines Analyzed</span>
                      <span className="stat-pill-value">{totalEngines}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Safety Guidance */}
          <div className="safety-guidance-card">
            <div className="card-header-simple">
              <ShieldCheck size={18} />
              <h3>Safety Guidance</h3>
            </div>
            <div className="guidance-content">
              {result.riskLevel === 'High Risk' || result.verdict === 'Unsafe / Malicious File' ? (
                <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  <p style={{ margin: '0 0 6px 0', fontWeight: 600 }}>
                    Multiple security engines identified this file as malicious.
                  </p>
                  <p style={{ margin: '0 0 6px 0' }}>
                    Do not open or execute this file.
                  </p>
                  <p style={{ margin: 0 }}>
                    Remove or quarantine it using trusted security software.
                  </p>
                </div>
              ) : result.riskLevel === 'Medium Risk' || result.verdict === 'Suspicious File' ? (
                <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  <p style={{ margin: '0 0 6px 0', fontWeight: 600 }}>
                    One or more security engines identified suspicious or potentially malicious characteristics.
                  </p>
                  <p style={{ margin: 0 }}>
                    Avoid opening or executing this file until it has been independently verified.
                  </p>
                </div>
              ) : result.riskLevel === 'Low Risk' || result.verdict === 'No Threat Detected' ? (
                <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  <p style={{ margin: '0 0 6px 0', fontWeight: 600 }}>
                    No malicious signatures were flagged by security engines.
                  </p>
                  <p style={{ margin: 0 }}>
                    Zero detections do not guarantee that a file is completely safe. Always exercise caution when handling files from unknown sources.
                  </p>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  The malware verification could not be completed. Please try again later.
                </p>
              )}
            </div>
          </div>

          {/* Collapsible Technical Details (Collapsed by default) */}
          <div className="technical-details-card">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="technical-accordion-btn"
              aria-expanded={showTechnicalDetails}
            >
              <div className="accordion-title-cluster">
                <Cpu size={16} />
                <span>Technical Details</span>
              </div>
              {showTechnicalDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showTechnicalDetails && (
              <div className="technical-details-content">
                <div className="tech-spec-grid">
                  <div className="tech-spec-item">
                    <span className="spec-label">Filename</span>
                    <span className="spec-value">
                      {result.file?.name || selectedFile?.name || 'Unknown'}
                    </span>
                  </div>

                  <div className="tech-spec-item">
                    <span className="spec-label">File Size</span>
                    <span className="spec-value">
                      {formatBytes(result.file?.size || selectedFile?.size || 0)}
                    </span>
                  </div>

                  <div className="tech-spec-item">
                    <span className="spec-label">MIME Type</span>
                    <span className="spec-value">
                      {result.file?.mimeType || selectedFile?.type || 'application/octet-stream'}
                    </span>
                  </div>

                  <div className="tech-spec-item">
                    <span className="spec-label">SHA-256</span>
                    <span className="spec-value">
                      <code>{result.file?.sha256 || sha256Hash || 'N/A'}</code>
                    </span>
                  </div>

                  {result.file?.sha1 && (
                    <div className="tech-spec-item">
                      <span className="spec-label">SHA-1</span>
                      <span className="spec-value">
                        <code>{result.file.sha1}</code>
                      </span>
                    </div>
                  )}

                  {result.file?.md5 && (
                    <div className="tech-spec-item">
                      <span className="spec-label">MD5</span>
                      <span className="spec-value">
                        <code>{result.file.md5}</code>
                      </span>
                    </div>
                  )}

                  <div className="tech-spec-item">
                    <span className="spec-label">VirusTotal Analysis Status</span>
                    <span className="spec-value">
                      {result.analysis?.status || 'completed'}
                    </span>
                  </div>

                  <div className="tech-spec-item">
                    <span className="spec-label">Analysis Timestamp</span>
                    <span className="spec-value">
                      {result.analysis?.timestamp
                        ? new Date(result.analysis.timestamp).toLocaleString()
                        : result.scanTimestamp
                        ? new Date(result.scanTimestamp).toLocaleString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Citizen Action Controls */}
          <div className="scanner-bottom-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button
              type="button"
              onClick={handleCopyReport}
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              {copiedReport ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedReport ? 'Report Copied' : 'Copy Forensic Report'}</span>
            </button>
            <a
              href="/incident-logs.html"
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
            >
              <FileText size={16} />
              <span>File Incident Report</span>
            </a>
            <button
              type="button"
              onClick={handleReset}
              className="btn-scan-another"
            >
              <RotateCcw size={16} />
              <span>Scan Another File</span>
            </button>
            <button
              type="button"
              onClick={onBack}
              className="btn-back-modules"
            >
              <ArrowLeft size={16} />
              <span>Return to Security Modules</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
