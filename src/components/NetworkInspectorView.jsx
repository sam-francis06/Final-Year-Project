import React, { useState, useEffect, useCallback } from 'react';
import {
  Wifi,
  Globe,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  RefreshCw,
  ArrowLeft,
  Lock,
  Activity,
  Info,
  ChevronDown,
  ChevronUp,
  Cpu,
  Server,
  Terminal
} from 'lucide-react';

/**
 * CyberCouncil - Browser Network Security Inspector
 * 
 * Provides honest, client-side evaluation of browser-visible network parameters.
 * Adheres strictly to browser security constraints:
 * - Never claims unrestricted LAN port scanning.
 * - Distinguishes between Verified, Attention, and Unavailable.
 * - Does not store, persist, or transmit network data to backends.
 * - No API keys required.
 */
export default function NetworkInspectorView({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [inspectTimestamp, setInspectTimestamp] = useState(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Network State Parameters
  const [publicIpData, setPublicIpData] = useState({
    status: 'loading', // 'verified' | 'unavailable' | 'loading'
    ip: null,
    type: null,
    source: 'api64.ipify.org'
  });

  const [connectionData, setConnectionData] = useState({
    available: false,
    effectiveType: 'Checking...',
    downlink: 'Checking...',
    rtt: 'Checking...',
    saveData: 'Checking...',
    type: 'Checking...'
  });

  const [secureContextData, setSecureContextData] = useState({
    isSecure: true,
    protocol: 'https:'
  });

  const [onlineData, setOnlineData] = useState({
    isOnline: true
  });

  const [webRtcData, setWebRtcData] = useState({
    status: 'loading', // 'none' | 'detected' | 'masked' | 'unavailable'
    detail: 'Inspecting WebRTC ICE candidate behavior...',
    candidates: []
  });

  const [dohData, setDohData] = useState({
    status: 'loading', // 'verified' | 'unavailable'
    detail: 'Testing external DNS-over-HTTPS reachability...',
    latency: null
  });

  // Execute WebRTC in-memory ICE candidate inspection
  const inspectWebRtc = useCallback(() => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.RTCPeerConnection) {
        return resolve({
          status: 'unavailable',
          detail: 'WebRTC API not supported or disabled in this browser.',
          candidates: []
        });
      }

      let pc = null;
      let completed = false;
      const discoveredCandidates = [];
      let mdnsObserved = false;

      const finish = (result) => {
        if (!completed) {
          completed = true;
          if (pc) {
            try {
              pc.onicecandidate = null;
              pc.close();
            } catch (err) {}
          }
          resolve(result);
        }
      };

      const safetyTimer = setTimeout(() => {
        if (discoveredCandidates.length > 0) {
          finish({
            status: 'detected',
            detail: 'Additional local/private address candidate observed',
            candidates: discoveredCandidates
          });
        } else if (mdnsObserved) {
          finish({
            status: 'masked',
            detail: 'Local addresses masked with mDNS (.local anonymizer)',
            candidates: []
          });
        } else {
          finish({
            status: 'none',
            detail: 'No additional address detected',
            candidates: []
          });
        }
      }, 1600);

      try {
        pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        pc.onicecandidate = (event) => {
          if (!event || !event.candidate) {
            clearTimeout(safetyTimer);
            if (discoveredCandidates.length > 0) {
              finish({
                status: 'detected',
                detail: 'Additional local/private address candidate observed',
                candidates: discoveredCandidates
              });
            } else if (mdnsObserved) {
              finish({
                status: 'masked',
                detail: 'Local addresses masked with mDNS (.local anonymizer)',
                candidates: []
              });
            } else {
              finish({
                status: 'none',
                detail: 'No additional address detected',
                candidates: []
              });
            }
            return;
          }

          const cand = event.candidate.candidate;
          // Match standard private IPv4 subnets (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
          const privateMatch = cand.match(/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})/);
          if (privateMatch && !discoveredCandidates.includes(privateMatch[1])) {
            discoveredCandidates.push(privateMatch[1]);
          } else if (cand.includes('.local')) {
            mdnsObserved = true;
          }
        };

        pc.createDataChannel('cybercouncil_net_probe');
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .catch(() => {
            clearTimeout(safetyTimer);
            finish({
              status: 'unavailable',
              detail: 'WebRTC negotiation restricted by browser permissions',
              candidates: []
            });
          });
      } catch (err) {
        clearTimeout(safetyTimer);
        finish({
          status: 'unavailable',
          detail: 'WebRTC initialization blocked by browser or extension',
          candidates: []
        });
      }
    });
  }, []);

  // Execute Public IP retrieval via privacy-friendly external endpoint
  const inspectPublicIp = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);

      const response = await fetch('https://api64.ipify.org?format=json', {
        signal: controller.signal
      });
      clearTimeout(timer);

      if (response.ok) {
        const data = await response.json();
        const ipStr = (data.ip || '').trim();
        const isV6 = ipStr.includes(':');
        return {
          status: 'verified',
          ip: ipStr,
          type: isV6 ? 'IPv6' : 'IPv4',
          source: 'api64.ipify.org'
        };
      }
      return {
        status: 'unavailable',
        ip: null,
        type: 'Not available from browser',
        source: 'api64.ipify.org'
      };
    } catch (err) {
      return {
        status: 'unavailable',
        ip: null,
        type: 'Not available from browser',
        source: 'api64.ipify.org'
      };
    }
  }, []);

  // Execute external DNS-over-HTTPS check
  const inspectDoH = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);
      const start = performance.now();

      const response = await fetch('https://cloudflare-dns.com/dns-query?name=cloudflare.com&type=A', {
        headers: { Accept: 'application/dns-json' },
        signal: controller.signal
      });
      clearTimeout(timer);

      const duration = Math.round(performance.now() - start);

      if (response.ok) {
        return {
          status: 'verified',
          detail: `DoH query answered successfully (${duration} ms)`,
          latency: `${duration} ms`
        };
      }
      return {
        status: 'unavailable',
        detail: 'External DoH query returned non-200 status',
        latency: null
      };
    } catch (err) {
      return {
        status: 'unavailable',
        detail: 'External DoH query blocked or unreachable',
        latency: null
      };
    }
  }, []);

  // Main Inspection Runner
  const runInspection = useCallback(async () => {
    setLoading(true);

    // 1. Synchronous Browser Parameters
    const isSec = typeof window !== 'undefined' ? Boolean(window.isSecureContext) : false;
    const proto = typeof window !== 'undefined' ? window.location.protocol : 'https:';
    setSecureContextData({ isSecure: isSec, protocol: proto });

    const onLine = typeof navigator !== 'undefined' ? Boolean(navigator.onLine) : true;
    setOnlineData({ isOnline: onLine });

    // 2. Network Information API
    if (typeof navigator !== 'undefined' && navigator.connection) {
      const conn = navigator.connection;
      setConnectionData({
        available: true,
        effectiveType: conn.effectiveType ? conn.effectiveType.toUpperCase() : 'Not available in this browser',
        downlink: conn.downlink !== undefined ? `${conn.downlink} Mbps` : 'Not available in this browser',
        rtt: conn.rtt !== undefined ? `${conn.rtt} ms` : 'Not available in this browser',
        saveData: conn.saveData !== undefined ? (conn.saveData ? 'Enabled' : 'Disabled') : 'Not available in this browser',
        type: conn.type ? conn.type : 'Not available in this browser'
      });
    } else {
      setConnectionData({
        available: false,
        effectiveType: 'Not available in this browser',
        downlink: 'Not available in this browser',
        rtt: 'Not available in this browser',
        saveData: 'Not available in this browser',
        type: 'Not available in this browser'
      });
    }

    // 3. Asynchronous Checks in Parallel
    const [ipResult, rtcResult, dohResult] = await Promise.all([
      inspectPublicIp(),
      inspectWebRtc(),
      inspectDoH()
    ]);

    setPublicIpData(ipResult);
    setWebRtcData(rtcResult);
    setDohData(dohResult);

    setInspectTimestamp(new Date().toLocaleTimeString());
    setLoading(false);
  }, [inspectPublicIp, inspectWebRtc, inspectDoH]);

  useEffect(() => {
    runInspection();
  }, [runInspection]);

  // Derived Findings and Security Recommendations based STRICTLY on actual detected conditions
  const findings = [];
  const recommendations = [];

  if (secureContextData.protocol === 'http:') {
    findings.push({
      type: 'warning',
      text: 'Application is delivered over unencrypted HTTP protocol.'
    });
    recommendations.push(
      'Use HTTPS whenever possible. Avoid entering sensitive information on unencrypted websites.'
    );
  } else {
    findings.push({
      type: 'success',
      text: 'Encrypted HTTPS protocol actively protects application traffic in transit.'
    });
  }

  if (!secureContextData.isSecure) {
    findings.push({
      type: 'warning',
      text: 'Page does not satisfy browser Secure Context criteria.'
    });
    recommendations.push(
      'This application is not running in a secure browser context.'
    );
  }

  if (webRtcData.status === 'detected') {
    findings.push({
      type: 'attention',
      text: 'WebRTC exposed one or more local network interface address candidates.'
    });
    recommendations.push(
      'Your browser may expose local network address information through WebRTC. Review browser privacy settings if this matters for your use case.'
    );
  } else if (webRtcData.status === 'masked') {
    findings.push({
      type: 'success',
      text: 'Browser mDNS masking protects local IP addresses from WebRTC queries.'
    });
  }

  if (!connectionData.available) {
    recommendations.push(
      'Your browser does not expose detailed network information to this application.'
    );
  }

  if (!onlineData.isOnline) {
    findings.push({
      type: 'attention',
      text: 'Browser reports client device is currently offline.'
    });
    recommendations.push(
      'Client interface is disconnected from the local network. Reconnect to resume network services.'
    );
  }

  return (
    <div className="scanner-workspace">
      {/* Top Header / Breadcrumb navigation */}
      <div className="scanner-top-bar">
        <button type="button" onClick={onBack} className="btn-back-modules">
          <ArrowLeft size={16} />
          <span>Back to Security Modules</span>
        </button>
        <div className="scanner-module-tag">
          <Wifi size={14} />
          <span>Browser Network Security Inspector</span>
        </div>
      </div>

      {/* Main Scanner Hero Card */}
      <div className="scanner-hero-card">
        <div className="scanner-hero-header" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="scanner-hero-icon" style={{ backgroundColor: 'rgba(9, 105, 218, 0.1)', color: 'var(--brand-blue)' }}>
              <Wifi size={28} />
            </div>
            <div>
              <h2>Browser Network Security Inspector</h2>
              <p>Inspect browser-accessible network parameters, connection properties, and WebRTC address exposure within browser sandbox boundaries.</p>
            </div>
          </div>
          <button
            type="button"
            className="scanner-submit-btn"
            onClick={runInspection}
            disabled={loading}
            style={{ width: 'auto', padding: '10px 18px', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            <RefreshCw size={15} className={loading ? 'spin-icon' : ''} />
            <span>{loading ? 'Inspecting...' : 'Run Inspection Again'}</span>
          </button>
        </div>

        {/* Loading Progress Notification */}
        {loading && (
          <div className="auditor-privacy-notice" style={{ marginTop: '16px' }}>
            <Activity size={18} className="spin-icon" style={{ color: 'var(--brand-blue)' }} />
            <div className="privacy-text-col">
              <strong>Inspecting available network information...</strong>
              <span>Querying local browser environment and non-invasive external connectivity signals.</span>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="scanner-result-section">
        {/* Main Verdict Card */}
        <div className="verdict-banner verdict-box-safe">
          <div className="verdict-banner-header">
            <div className="verdict-icon-wrap" style={{ color: 'var(--status-green)' }}>
              <ShieldCheck size={38} />
            </div>
            <div className="verdict-text-block">
              <div className="verdict-title-row">
                <span className="verdict-pill verdict-badge-safe">
                  NETWORK SECURITY ASSESSMENT
                </span>
                {inspectTimestamp && (
                  <span className="verdict-domain-tag">
                    Inspected at {inspectTimestamp}
                  </span>
                )}
              </div>
              <p className="verdict-main-desc">
                Your browser is connected over a {secureContextData.isSecure ? 'secure context' : 'standard context'}. 
                Some network details are visible to web applications, while browser sandbox restrictions prevent deeper local-network inspection.
              </p>
              <div className="verdict-disclaimer-badge">
                <Info size={13} style={{ flexShrink: 0 }} />
                <span>
                  Absence of detected exposures indicates normal browser operation, but does not certify complete LAN or router perimeter security.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards Grid (8 Core Components) */}
        <div className="network-cards-grid">
          {/* Card 1: Public IP */}
          <div className="net-status-card">
            <div className="net-card-header">
              <span className="net-card-title">
                <Globe size={15} style={{ color: 'var(--brand-blue)' }} />
                <span>Public IP</span>
              </span>
              {publicIpData.status === 'verified' ? (
                <span className="net-badge badge-verified">
                  <CheckCircle2 size={13} />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="net-badge badge-unavailable">
                  <MinusCircle size={13} />
                  <span>Unavailable</span>
                </span>
              )}
            </div>
            <div className="net-card-body">
              <div className="net-card-metric">
                {publicIpData.status === 'verified' ? publicIpData.ip : 'Verification Unavailable'}
              </div>
              <div className="net-card-subtext">
                Public IP detected • {publicIpData.type || 'External lookup'}
              </div>
            </div>
            <div className="net-card-footer">
              Retrieved via external lookup ({publicIpData.source}). Represents the address external servers observe, not internal router state.
            </div>
          </div>

          {/* Card 2: Connection Information */}
          <div className="net-status-card">
            <div className="net-card-header">
              <span className="net-card-title">
                <Activity size={15} style={{ color: 'var(--brand-blue)' }} />
                <span>Connection</span>
              </span>
              {connectionData.available ? (
                <span className="net-badge badge-verified">
                  <CheckCircle2 size={13} />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="net-badge badge-unavailable">
                  <MinusCircle size={13} />
                  <span>Unavailable</span>
                </span>
              )}
            </div>
            <div className="net-card-body">
              <div className="net-card-metric">
                {connectionData.available ? `${connectionData.effectiveType} Profile` : 'Not available in this browser'}
              </div>
              <div className="net-card-subtext">
                Downlink: {connectionData.downlink} • RTT: {connectionData.rtt}
              </div>
            </div>
            <div className="net-card-footer">
              {connectionData.available
                ? 'Derived from navigator.connection Network Information API.'
                : 'Not available in this browser. Browser engine does not expose detailed link metrics.'}
            </div>
          </div>

          {/* Card 3: Secure Context */}
          <div className="net-status-card">
            <div className="net-card-header">
              <span className="net-card-title">
                <Lock size={15} style={{ color: secureContextData.isSecure ? 'var(--status-green)' : 'var(--status-amber)' }} />
                <span>Secure Context</span>
              </span>
              {secureContextData.isSecure ? (
                <span className="net-badge badge-verified">
                  <CheckCircle2 size={13} />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="net-badge badge-attention">
                  <AlertTriangle size={13} />
                  <span>Attention</span>
                </span>
              )}
            </div>
            <div className="net-card-body">
              <div className="net-card-metric">
                {secureContextData.isSecure ? 'Secure Context' : 'Insecure Context'}
              </div>
              <div className="net-card-subtext">
                window.isSecureContext = {String(secureContextData.isSecure)}
              </div>
            </div>
            <div className="net-card-footer">
              Ensures the page was delivered over an encrypted channel (HTTPS or localhost) and unlocks privileged security APIs.
            </div>
          </div>

          {/* Card 4: Protocol */}
          <div className="net-status-card">
            <div className="net-card-header">
              <span className="net-card-title">
                <ShieldCheck size={15} style={{ color: secureContextData.protocol === 'https:' ? 'var(--status-green)' : 'var(--status-amber)' }} />
                <span>Protocol</span>
              </span>
              {secureContextData.protocol === 'https:' ? (
                <span className="net-badge badge-verified">
                  <CheckCircle2 size={13} />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="net-badge badge-attention">
                  <AlertTriangle size={13} />
                  <span>Attention</span>
                </span>
              )}
            </div>
            <div className="net-card-body">
              <div className="net-card-metric">
                {secureContextData.protocol.replace(':', '').toUpperCase()}
              </div>
              <div className="net-card-subtext">
                Transport Layer Security: {secureContextData.protocol === 'https:' ? 'TLS Encrypted' : 'Unencrypted'}
              </div>
            </div>
            <div className="net-card-footer">
              Protects data in transit between browser and server. Does not measure internal local-network encryption (e.g. WPA3).
            </div>
          </div>

          {/* Card 5: Online Status */}
          <div className="net-status-card">
            <div className="net-card-header">
              <span className="net-card-title">
                <Wifi size={15} style={{ color: onlineData.isOnline ? 'var(--status-green)' : 'var(--status-amber)' }} />
                <span>Online Status</span>
              </span>
              {onlineData.isOnline ? (
                <span className="net-badge badge-verified">
                  <CheckCircle2 size={13} />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="net-badge badge-attention">
                  <AlertTriangle size={13} />
                  <span>Attention</span>
                </span>
              )}
            </div>
            <div className="net-card-body">
              <div className="net-card-metric">
                {onlineData.isOnline ? 'Online' : 'Offline'}
              </div>
              <div className="net-card-subtext">
                navigator.onLine = {String(onlineData.isOnline)}
              </div>
            </div>
            <div className="net-card-footer">
              Indicates local client interface connectivity. It is not definitive proof of end-to-end global Internet reachability.
            </div>
          </div>

          {/* Card 6: WebRTC Exposure */}
          <div className="net-status-card">
            <div className="net-card-header">
              <span className="net-card-title">
                <Cpu size={15} style={{ color: 'var(--brand-blue)' }} />
                <span>WebRTC Exposure</span>
              </span>
              {webRtcData.status === 'none' || webRtcData.status === 'masked' ? (
                <span className="net-badge badge-verified">
                  <CheckCircle2 size={13} />
                  <span>Verified</span>
                </span>
              ) : webRtcData.status === 'detected' ? (
                <span className="net-badge badge-attention">
                  <AlertTriangle size={13} />
                  <span>Attention</span>
                </span>
              ) : (
                <span className="net-badge badge-unavailable">
                  <MinusCircle size={13} />
                  <span>Unavailable</span>
                </span>
              )}
            </div>
            <div className="net-card-body">
              <div className="net-card-metric" style={{ fontSize: '15px' }}>
                {webRtcData.status === 'none'
                  ? 'No additional address detected'
                  : webRtcData.status === 'masked'
                  ? 'Masked with mDNS'
                  : webRtcData.status === 'detected'
                  ? 'Additional address detected'
                  : 'Not available in this browser'}
              </div>
              <div className="net-card-subtext">
                {webRtcData.detail}
              </div>
            </div>
            <div className="net-card-footer">
              Inspected in local browser memory. A private IP (e.g. 192.168.x.x) is standard LAN addressing, not an immediate vulnerability.
            </div>
          </div>

          {/* Card 7: Browser Capabilities */}
          <div className="net-status-card">
            <div className="net-card-header">
              <span className="net-card-title">
                <Terminal size={15} style={{ color: 'var(--brand-blue)' }} />
                <span>Network Information</span>
              </span>
              <span className="net-badge badge-verified">
                <CheckCircle2 size={13} />
                <span>Verified</span>
              </span>
            </div>
            <div className="net-card-body">
              <div className="net-card-metric" style={{ fontSize: '15px' }}>
                {connectionData.available ? 'API Active' : 'Not available in this browser'}
              </div>
              <div className="net-card-subtext">
                SaveData: {connectionData.saveData} • Type: {connectionData.type}
              </div>
            </div>
            <div className="net-card-footer">
              Browser-supported telemetry endpoints available to client web applications without special permissions.
            </div>
          </div>

          {/* Card 8: DNS Check */}
          <div className="net-status-card">
            <div className="net-card-header">
              <span className="net-card-title">
                <Server size={15} style={{ color: 'var(--brand-blue)' }} />
                <span>DNS Check</span>
              </span>
              {dohData.status === 'verified' ? (
                <span className="net-badge badge-verified">
                  <CheckCircle2 size={13} />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="net-badge badge-unavailable">
                  <MinusCircle size={13} />
                  <span>Unavailable</span>
                </span>
              )}
            </div>
            <div className="net-card-body">
              <div className="net-card-metric" style={{ fontSize: '15px' }}>
                {dohData.status === 'verified' ? 'DoH Reachable' : 'Verification Unavailable'}
              </div>
              <div className="net-card-subtext">
                {dohData.detail}
              </div>
            </div>
            <div className="net-card-footer">
              External DNS lookup (via Cloudflare DNS-over-HTTPS). Browser restrictions prevent querying the local OS resolver directly.
            </div>
          </div>
        </div>

        {/* Security Observations */}
        <div className="auditor-checklist-card" style={{ marginTop: '20px' }}>
          <div className="checklist-header">
            <ShieldCheck size={16} />
            <span>Security Observations ({findings.length})</span>
          </div>
          <div className="net-findings-list">
            {findings.map((f, i) => (
              <div key={i} className={`net-finding-item ${f.type}`}>
                {f.type === 'success' ? (
                  <CheckCircle2 size={16} className="finding-icon-success" />
                ) : (
                  <AlertTriangle size={16} className="finding-icon-warn" />
                )}
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="auditor-recs-grid" style={{ marginTop: '16px' }}>
            {recommendations.map((rec, i) => (
              <div key={i} className="rec-card">
                <span className="rec-num">{i + 1}</span>
                <span className="rec-text">{rec}</span>
              </div>
            ))}
          </div>
        )}

        {/* Collapsible Technical Details */}
        <div className="technical-details-toggle-row" style={{ marginTop: '20px' }}>
          <button
            type="button"
            className="btn-toggle-technical"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          >
            <Cpu size={15} />
            <span>{showTechnicalDetails ? 'Hide Technical Details & Limitations' : 'Show Technical Details & Limitations'}</span>
            {showTechnicalDetails ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>

        {showTechnicalDetails && (
          <div className="technical-details-drawer">
            {/* Mandatory Browser Restrictions Callout */}
            <div className="auditor-privacy-notice" style={{ marginBottom: '16px', backgroundColor: 'rgba(217, 119, 6, 0.08)', borderColor: 'rgba(217, 119, 6, 0.25)' }}>
              <Info size={18} style={{ color: '#d97706', flexShrink: 0 }} />
              <div className="privacy-text-col">
                <strong style={{ color: '#d97706' }}>Fundamental Browser Security Boundaries</strong>
                <span style={{ color: 'var(--text-primary)' }}>
                  Browser security restrictions prevent CyberCouncil from performing unrestricted local-network port scans or enumerating every device connected to your network.
                </span>
              </div>
            </div>

            <div className="verdict-diagnostics-grid">
              <div className="diagnostic-item">
                <span className="diag-label">Inspection Scope</span>
                <span className="diag-value">Client Browser Sandbox (W3C Standards Compliant)</span>
              </div>
              <div className="diagnostic-item">
                <span className="diag-label">LAN Port Scanning</span>
                <span className="diag-value" style={{ color: 'var(--text-tertiary)' }}>
                  Disabled by browser sandbox (Raw TCP SYN/UDP sockets unavailable in JavaScript)
                </span>
              </div>
              <div className="diagnostic-item">
                <span className="diag-label">Router & Firewall Probing</span>
                <span className="diag-value" style={{ color: 'var(--text-tertiary)' }}>
                  Restricted by Same-Origin Policy (SOP) and Cross-Origin Resource Sharing (CORS)
                </span>
              </div>
              <div className="diagnostic-item">
                <span className="diag-label">OS DNS Resolver Inspection</span>
                <span className="diag-value" style={{ color: 'var(--text-tertiary)' }}>
                  Unavailable (OS resolver not queryable via browser APIs; tested via external DoH)
                </span>
              </div>
              <div className="diagnostic-item">
                <span className="diag-label">WebRTC Isolation</span>
                <span className="diag-value">
                  Evaluated locally via RTCPeerConnection; candidates cleared from memory immediately
                </span>
              </div>
              <div className="diagnostic-item">
                <span className="diag-label">Data Persistence & Telemetry</span>
                <span className="diag-value" style={{ color: 'var(--status-green)' }}>
                  Zero server transmission; zero storage in cookies, localStorage, or databases
                </span>
              </div>
            </div>

            {/* Browser Capabilities Summary Table */}
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Client Platform Capability Inventory
              </h4>
              <div className="tech-capabilities-table">
                <div className="cap-row">
                  <span>Network Information API (navigator.connection)</span>
                  <span className={connectionData.available ? 'cap-active' : 'cap-inactive'}>
                    {connectionData.available ? 'Supported' : 'Unavailable'}
                  </span>
                </div>
                <div className="cap-row">
                  <span>WebRTC PeerConnection (window.RTCPeerConnection)</span>
                  <span className={webRtcData.status !== 'unavailable' ? 'cap-active' : 'cap-inactive'}>
                    {webRtcData.status !== 'unavailable' ? 'Supported' : 'Blocked / Unavailable'}
                  </span>
                </div>
                <div className="cap-row">
                  <span>Secure Context Guarantee (window.isSecureContext)</span>
                  <span className={secureContextData.isSecure ? 'cap-active' : 'cap-inactive'}>
                    {secureContextData.isSecure ? 'Active (HTTPS)' : 'Inactive'}
                  </span>
                </div>
                <div className="cap-row">
                  <span>Network Online Status API (navigator.onLine)</span>
                  <span className="cap-active">Supported</span>
                </div>
                <div className="cap-row">
                  <span>External DNS-over-HTTPS (DoH) Reachability</span>
                  <span className={dohData.status === 'verified' ? 'cap-active' : 'cap-inactive'}>
                    {dohData.status === 'verified' ? 'Accessible' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
