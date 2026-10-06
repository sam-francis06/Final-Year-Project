import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  HelpCircle,
  ArrowLeft,
  Search,
  ExternalLink,
  Lock,
  Unlock,
  Globe,
  CheckCircle2,
  RefreshCw,
  Info,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  Clock,
  Server
} from 'lucide-react';

// Free-tier public DNS-over-HTTPS endpoints (Secondary fallback signals)
const CLOUDFLARE_DOH = 'https://cloudflare-dns.com/dns-query';
const GOOGLE_DOH = 'https://dns.google/resolve';

// Target brands frequently targeted in India & globally (Secondary signal)
const SENSITIVE_BRANDS = [
  { name: 'State Bank of India', key: 'sbi', official: ['onlinesbi.sbi', 'sbi.co.in'] },
  { name: 'HDFC Bank', key: 'hdfc', official: ['hdfcbank.com', 'hdfc.com'] },
  { name: 'ICICI Bank', key: 'icici', official: ['icicibank.com'] },
  { name: 'PayPal', key: 'paypal', official: ['paypal.com'] },
  { name: 'Google', key: 'google', official: ['google.com', 'google.co.in'] },
  { name: 'Microsoft', key: 'microsoft', official: ['microsoft.com', 'live.com', 'outlook.com'] },
  { name: 'Apple', key: 'apple', official: ['apple.com', 'icloud.com'] },
  { name: 'Amazon', key: 'amazon', official: ['amazon.com', 'amazon.in'] },
  { name: 'Netflix', key: 'netflix', official: ['netflix.com'] },
  { name: 'Income Tax India', key: 'incometax', official: ['incometax.gov.in'] },
  { name: 'UIDAI / Aadhaar', key: 'uidai', official: ['uidai.gov.in'] },
  { name: 'Paytm', key: 'paytm', official: ['paytm.com'] }
];

// High-risk abuse TLDs (Secondary signal)
const HIGH_RISK_TLDS = new Set([
  'xyz', 'top', 'click', 'buzz', 'cam', 'fit', 'gq', 'tk', 'ml', 'ga', 'cf',
  'work', 'rest', 'country', 'stream', 'surf', 'loan', 'racing', 'download'
]);

// Suspicious keywords (Secondary signal)
const PHISHING_KEYWORDS = [
  'login', 'signin', 'verify', 'verification', 'secure', 'banking', 'account-update',
  'authenticate', 'wallet', 'alert', 'confirm', 'kyc', 'otp', 'claim-reward', 'unlock'
];

export default function PhishingScannerView({ onBack }) {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Quick sample URLs for instant demonstration
  const sampleUrls = [
    { label: 'Clean (google.com)', url: 'https://google.com' },
    { label: 'Example (example.com)', url: 'https://example.com' },
    { label: 'Suspicious Brand (sbi-kyc-verify.xyz)', url: 'http://sbi-kyc-verify-login.xyz' },
    { label: 'Insecure HTTP (example.org)', url: 'http://example.org' }
  ];

  const handleCopySummary = () => {
    if (!result) return;
    const summary = `CyberCouncil VirusTotal Scan Report:
URL: ${result.normalizedUrl}
Verdict: ${result.verdictTitle}
Summary: ${result.verdictDescription}
VirusTotal Stats: ${result.stats.malicious} malicious, ${result.stats.suspicious} suspicious, ${result.stats.harmless} harmless, ${result.stats.undetected} undetected (${result.totalEngines} total security vendors)
Timestamp: ${result.scanTimestamp || new Date().toISOString()}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScan = async (targetUrl = urlInput) => {
    const raw = (targetUrl || '').trim();
    if (!raw) return;

    setIsLoading(true);
    setResult(null);
    setShowTechnicalDetails(false);

    // 1. URL Normalization
    let formattedUrl = raw;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(formattedUrl);
    } catch {
      setIsLoading(false);
      setResult({
        verdict: 'unavailable',
        verdictTitle: 'Verification Unavailable',
        verdictDescription: 'The provided web address is malformed or invalid. Please check the spelling and format.',
        disclaimer: null,
        normalizedUrl: raw,
        domain: raw,
        protocol: 'Unknown',
        ipAddresses: [],
        signals: ['Invalid URL format'],
        stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
        totalEngines: 0,
        flaggedEngines: [],
        scanTimestamp: new Date().toISOString(),
        source: 'VirusTotal v3'
      });
      return;
    }

    const domain = parsedUrl.hostname.toLowerCase();
    const protocol = parsedUrl.protocol;
    const pathAndQuery = parsedUrl.pathname + parsedUrl.search;
    const secondarySignals = [];
    let isBrandSpoofed = false;
    let spoofedBrandName = '';

    // 2. Secondary Signals: Protocol check
    const isHttps = protocol === 'https:';
    if (!isHttps) {
      secondarySignals.push('Insecure connection (Plain HTTP without encryption)');
    }

    // 3. Secondary Signals: Raw IP check
    const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(domain);
    if (isIpHost) {
      secondarySignals.push('Raw IP address used instead of a registered domain name');
    }

    // 4. Secondary Signals: Punycode / Homograph check
    if (domain.startsWith('xn--') || /[^\u0000-\u007F]/.test(domain)) {
      secondarySignals.push('Punycode / Homograph character detected (possible character spoofing)');
    }

    // 5. Secondary Signals: TLD risk check
    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];
    if (HIGH_RISK_TLDS.has(tld)) {
      secondarySignals.push(`High-risk top-level domain (.${tld}) commonly used for disposable phishing sites`);
    }

    // 6. Secondary Signals: Excessive subdomains
    if (domainParts.length > 3 && !domain.endsWith('.co.in') && !domain.endsWith('.gov.in')) {
      secondarySignals.push(`Multiple nested subdomains (${domainParts.length} levels) detected`);
    }

    // 7. Secondary Signals: Keyword analysis
    const matchedKeywords = PHISHING_KEYWORDS.filter(kw => 
      domain.includes(kw) || pathAndQuery.toLowerCase().includes(kw)
    );
    if (matchedKeywords.length > 0) {
      secondarySignals.push(`Credential/banking triggers detected: ${matchedKeywords.slice(0, 3).join(', ')}`);
    }

    // 8. Secondary Signals: Brand impersonation check
    for (const brand of SENSITIVE_BRANDS) {
      const isOfficial = brand.official.some(off => domain === off || domain.endsWith('.' + off));
      if (!isOfficial && domain.includes(brand.key)) {
        isBrandSpoofed = true;
        spoofedBrandName = brand.name;
        secondarySignals.push(`Potential brand impersonation: matches "${brand.name}" but is not on an official domain`);
        break;
      }
    }

    // 9. Secondary Signals: Live DNS-over-HTTPS resolution in background
    let resolvedIps = [];
    const dohPromise = (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const dohRes = await fetch(`${CLOUDFLARE_DOH}?name=${encodeURIComponent(domain)}&type=A`, {
          headers: { 'Accept': 'application/dns-json' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (dohRes.ok) {
          const dohData = await dohRes.json();
          if (dohData.Status === 0 && dohData.Answer && dohData.Answer.length > 0) {
            return dohData.Answer.filter(a => a.type === 1).map(a => a.data);
          }
        }
      } catch {
        // Fallback to Google DoH
        try {
          const gRes = await fetch(`${GOOGLE_DOH}?name=${encodeURIComponent(domain)}&type=A`);
          if (gRes.ok) {
            const gData = await gRes.json();
            if (gData.Status === 0 && gData.Answer && gData.Answer.length > 0) {
              return gData.Answer.filter(a => a.type === 1).map(a => a.data);
            }
          }
        } catch {}
      }
      return [];
    })();

    // 10. PRIMARY Threat Scan: Call CyberCouncil Backend API (VirusTotal v3)
    let vtResponse = null;
    try {
      const apiRes = await fetch('/api/scan-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formattedUrl })
      });

      if (apiRes.ok) {
        vtResponse = await apiRes.json();
      } else {
        vtResponse = {
          success: false,
          verdict: 'Verification Unavailable',
          message: `Scanner API error (Status ${apiRes.status}). Please verify server backend status.`,
          stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
          flaggedEngines: [],
          source: 'VirusTotal v3'
        };
      }
    } catch {
      vtResponse = {
        success: false,
        verdict: 'Verification Unavailable',
        message: 'Could not connect to CyberCouncil scanner backend. Please ensure the dev server is running.',
        stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
        flaggedEngines: [],
        source: 'VirusTotal v3'
      };
    }

    // Await secondary DoH result
    try {
      resolvedIps = await dohPromise;
    } catch {}

    // 11. Normalize Verdicts based on VirusTotal as PRIMARY
    let finalVerdict = 'unavailable';
    let finalVerdictTitle = 'Verification Unavailable';
    let finalVerdictDescription = vtResponse?.message || 'Verification could not be completed.';
    let disclaimer = null;

    if (vtResponse && vtResponse.verdict) {
      if (vtResponse.verdict === 'Unsafe Website') {
        finalVerdict = 'unsafe';
        finalVerdictTitle = 'Unsafe Website';
        finalVerdictDescription = vtResponse.message;
      } else if (vtResponse.verdict === 'Be Careful') {
        finalVerdict = 'careful';
        finalVerdictTitle = 'Be Careful';
        finalVerdictDescription = vtResponse.message;
      } else if (vtResponse.verdict === 'No Threat Detected') {
        finalVerdict = 'safe';
        finalVerdictTitle = 'No Threat Detected';
        finalVerdictDescription = vtResponse.message;
        disclaimer = vtResponse.disclaimer || 'Zero detections do not guarantee that a website is safe.';
      } else {
        finalVerdict = 'unavailable';
        finalVerdictTitle = 'Verification Unavailable';
        finalVerdictDescription = vtResponse.message;
      }
    }

    setResult({
      verdict: finalVerdict,
      verdictTitle: finalVerdictTitle,
      verdictDescription: finalVerdictDescription,
      disclaimer,
      normalizedUrl: formattedUrl,
      domain,
      protocol: protocol.toUpperCase().replace(':', ''),
      ipAddresses: resolvedIps,
      signals: secondarySignals,
      stats: vtResponse?.stats || { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
      totalEngines: vtResponse?.totalEngines || 0,
      flaggedEngines: vtResponse?.flaggedEngines || [],
      scanTimestamp: vtResponse?.scanTimestamp || new Date().toISOString(),
      source: vtResponse?.source || 'VirusTotal v3'
    });

    setIsLoading(false);
  };

  const getVerdictTheme = (verdict) => {
    switch (verdict) {
      case 'safe':
        return {
          icon: <ShieldCheck size={36} />,
          badgeClass: 'verdict-badge-safe',
          boxClass: 'verdict-box-safe',
          color: 'var(--status-green)'
        };
      case 'careful':
        return {
          icon: <AlertTriangle size={36} />,
          badgeClass: 'verdict-badge-amber',
          boxClass: 'verdict-box-amber',
          color: 'var(--status-amber)'
        };
      case 'unsafe':
        return {
          icon: <ShieldX size={36} />,
          badgeClass: 'verdict-badge-danger',
          boxClass: 'verdict-box-danger',
          color: '#cf222e'
        };
      case 'unavailable':
      default:
        return {
          icon: <HelpCircle size={36} />,
          badgeClass: 'verdict-badge-neutral',
          boxClass: 'verdict-box-neutral',
          color: 'var(--text-secondary)'
        };
    }
  };

  return (
    <div className="scanner-workspace">
      {/* Top Header / Breadcrumb navigation */}
      <div className="scanner-top-bar">
        <button type="button" onClick={onBack} className="btn-back-modules">
          <ArrowLeft size={16} />
          <span>Back to Security Modules</span>
        </button>
        <div className="scanner-module-tag">
          <ShieldAlert size={14} />
          <span>VirusTotal v3 Threat Inspection</span>
        </div>
      </div>

      {/* Main Scanner Card */}
      <div className="scanner-hero-card">
        <div className="scanner-hero-header">
          <div className="scanner-hero-icon">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h2>Phishing & Domain Scanner</h2>
            <p>Verify links and domain registrations in real time with VirusTotal API v3 before clicking or submitting personal details.</p>
          </div>
        </div>

        {/* URL Input Form */}
        <form 
          className="scanner-input-container" 
          onSubmit={(e) => { e.preventDefault(); handleScan(); }}
        >
          <div className="scanner-input-wrapper">
            <Globe size={18} className="scanner-input-icon" />
            <input
              type="text"
              className="scanner-url-field"
              placeholder="Paste or type website link (e.g. https://google.com or suspicious-link.xyz)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
            {urlInput && !isLoading && (
              <button
                type="button"
                className="scanner-clear-btn"
                onClick={() => setUrlInput('')}
                title="Clear input"
              >
                ×
              </button>
            )}
          </div>
          <button
            type="submit"
            className="scanner-submit-btn"
            disabled={isLoading || !urlInput.trim()}
          >
            {isLoading ? (
              <>
                <RefreshCw size={17} className="spin-animation" />
                <span>Analyzing with VirusTotal...</span>
              </>
            ) : (
              <>
                <Search size={17} />
                <span>Check Website</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Picks */}
        <div className="scanner-samples-row">
          <span className="scanner-samples-label">Quick samples:</span>
          {sampleUrls.map((s, idx) => (
            <button
              key={idx}
              type="button"
              className="scanner-sample-pill"
              onClick={() => {
                setUrlInput(s.url);
                handleScan(s.url);
              }}
              disabled={isLoading}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result Display Area */}
      {result && (
        <div className="scanner-result-section">
          {(() => {
            const theme = getVerdictTheme(result.verdict);
            return (
              <div className={`verdict-banner ${theme.boxClass}`}>
                <div className="verdict-banner-header">
                  <div className="verdict-icon-wrap" style={{ color: theme.color }}>
                    {theme.icon}
                  </div>
                  <div className="verdict-text-block">
                    <div className="verdict-title-row">
                      <span className={`verdict-pill ${theme.badgeClass}`}>
                        {result.verdictTitle}
                      </span>
                      <span className="verdict-domain-tag">{result.domain}</span>
                    </div>
                    <p className="verdict-main-desc">{result.verdictDescription}</p>
                    
                    {/* Explicit citizen safety disclaimer */}
                    {result.disclaimer && (
                      <div className="verdict-disclaimer-badge">
                        <Info size={14} />
                        <span>{result.disclaimer}</span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="btn-copy-verdict"
                    title="Copy scan report to clipboard"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Primary Telemetry: VirusTotal Engine Stats Bar */}
                {result.totalEngines > 0 && (
                  <div className="vt-stats-strip">
                    <div className="vt-stat-cell stat-malicious">
                      <span className="vt-stat-num">{result.stats.malicious}</span>
                      <span className="vt-stat-label">Malicious</span>
                    </div>
                    <div className="vt-stat-cell stat-suspicious">
                      <span className="vt-stat-num">{result.stats.suspicious}</span>
                      <span className="vt-stat-label">Suspicious</span>
                    </div>
                    <div className="vt-stat-cell stat-harmless">
                      <span className="vt-stat-num">{result.stats.harmless}</span>
                      <span className="vt-stat-label">Harmless</span>
                    </div>
                    <div className="vt-stat-cell stat-undetected">
                      <span className="vt-stat-num">{result.stats.undetected}</span>
                      <span className="vt-stat-label">Undetected</span>
                    </div>
                    <div className="vt-stat-summary">
                      <span>Across <strong>{result.totalEngines}</strong> security engines</span>
                    </div>
                  </div>
                )}

                {/* Collapsible Technical Details Trigger */}
                <div className="technical-details-toggle-row">
                  <button
                    type="button"
                    className="btn-toggle-technical"
                    onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  >
                    <Cpu size={15} />
                    <span>{showTechnicalDetails ? 'Hide Technical & Vendor Breakdown' : 'Show Technical & Vendor Breakdown'}</span>
                    {showTechnicalDetails ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>

                {/* Collapsible Technical & Diagnostics Body */}
                {showTechnicalDetails && (
                  <div className="technical-details-drawer">
                    <div className="verdict-diagnostics-grid">
                      <div className="diagnostic-item">
                        <span className="diag-label">Inspected Target</span>
                        <span className="diag-value diag-url" title={result.normalizedUrl}>
                          {result.normalizedUrl}
                        </span>
                      </div>

                      <div className="diagnostic-item">
                        <span className="diag-label">Primary Engine</span>
                        <span className="diag-value">
                          <span className="badge-secure"><Server size={13} /> {result.source}</span>
                        </span>
                      </div>

                      <div className="diagnostic-item">
                        <span className="diag-label">Transport Security</span>
                        <span className="diag-value">
                          {result.protocol === 'HTTPS' ? (
                            <span className="badge-secure"><Lock size={13} /> Encrypted (HTTPS)</span>
                          ) : (
                            <span className="badge-insecure"><Unlock size={13} /> Unencrypted (HTTP)</span>
                          )}
                        </span>
                      </div>

                      <div className="diagnostic-item">
                        <span className="diag-label">DNS Resolution (Secondary)</span>
                        <span className="diag-value">
                          {result.ipAddresses.length > 0 ? (
                            <span className="badge-secure">
                              <CheckCircle2 size={13} /> Resolved ({result.ipAddresses[0]})
                            </span>
                          ) : (
                            <span className="badge-neutral">Direct / Host Target</span>
                          )}
                        </span>
                      </div>

                      <div className="diagnostic-item">
                        <span className="diag-label">Scan Timestamp</span>
                        <span className="diag-value">
                          <Clock size={13} /> {result.scanTimestamp ? new Date(result.scanTimestamp).toLocaleString() : 'Recent'}
                        </span>
                      </div>
                    </div>

                    {/* Flagged Vendor Names */}
                    {result.flaggedEngines.length > 0 && (
                      <div className="flagged-engines-box">
                        <div className="signals-title">
                          <ShieldAlert size={15} style={{ color: '#cf222e' }} />
                          <span>Flagging Security Engines ({result.flaggedEngines.length})</span>
                        </div>
                        <div className="flagged-tags-cluster">
                          {result.flaggedEngines.map((eng, idx) => (
                            <span key={idx} className="engine-flag-tag">
                              <strong>{eng.name}:</strong> {eng.result}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Secondary Evaluation Signals & Heuristics */}
                    {result.signals.length > 0 && (
                      <div className="verdict-signals-box">
                        <div className="signals-title">
                          <Info size={15} />
                          <span>Secondary Supporting Signals & Heuristics</span>
                        </div>
                        <ul className="signals-list">
                          {result.signals.map((sig, i) => (
                            <li key={i}>{sig}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Citizen Security Advice */}
          <div className="scanner-guidance-card">
            <h3>Cyber Safety Rules for Citizens</h3>
            <div className="guidance-grid">
              <div className="guidance-item">
                <div className="guidance-number">1</div>
                <div>
                  <strong>Inspect the exact address</strong>
                  <p>Cybercriminals replace letters with numbers (e.g. <code>paypa1</code> or <code>amaz0n</code>). Always verify every character.</p>
                </div>
              </div>
              <div className="guidance-item">
                <div className="guidance-number">2</div>
                <div>
                  <strong>Never share OTPs or PINs</strong>
                  <p>Legitimate organizations, banks, and government agencies will never ask for your password, PIN, or OTP over an SMS or email link.</p>
                </div>
              </div>
              <div className="guidance-item">
                <div className="guidance-number">3</div>
                <div>
                  <strong>Report suspicious incidents</strong>
                  <p>If you were sent an unsafe fraudulent link, log it in the <a href="/incident-logs.html">Incident Logs</a> or file a report on the National Cyber Crime Reporting Portal (1930).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
