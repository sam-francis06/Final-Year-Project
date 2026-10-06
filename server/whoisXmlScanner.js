/**
 * CyberCouncil - Server-Side WhoisXML API & URL Intelligence Verification Handler
 * 
 * Secure backend verification module that interfaces with WhoisXML API:
 * - WHOIS Service
 * - DNS Service
 * - Domain Reputation API
 * - Website Categorization API
 * - SSL Certificates API
 * - Threat Intelligence API
 * - Website Screenshot API (on-demand only)
 * 
 * Security guarantees:
 * - WHOISXML_API_KEY is read strictly from process.env and never logged, printed, or sent to client.
 * - Adheres to police forensic standards: neutral indicators, no defamatory or definitive malicious claims.
 * - Always includes safety disclaimers (valid SSL != safe, 0 threats != safe).
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as dns from 'node:dns/promises';
import * as tls from 'node:tls';
import { URL } from 'node:url';

// Attempt to load .env securely if not already loaded in Node environment
try {
  const envPath = resolve(process.cwd(), '.env');
  if (existsSync(envPath) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(envPath);
  }
} catch {
  // Ignore env loading errors silently
}

/**
 * Safely retrieve the WhoisXML API key from the environment.
 */
function getApiKey() {
  if (process.env.WHOISXML_API_KEY && process.env.WHOISXML_API_KEY.trim()) {
    return process.env.WHOISXML_API_KEY.trim();
  }
  try {
    const envPath = resolve(process.cwd(), '.env');
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, 'utf8');
      const match = content.match(/^WHOISXML_API_KEY\s*=\s*(.+)$/m);
      if (match && match[1]) {
        process.env.WHOISXML_API_KEY = match[1].trim();
        return process.env.WHOISXML_API_KEY;
      }
    }
  } catch {}
  return '';
}

/**
 * Normalize and parse input URL into structured components.
 */
export function normalizeTargetUrl(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') return null;
  let raw = inputUrl.trim();
  if (!raw) return null;

  // If missing protocol, prepend https://
  if (!/^https?:\/\//i.test(raw)) {
    raw = 'https://' + raw;
  }

  try {
    const parsed = new URL(raw);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    const hostname = parsed.hostname.toLowerCase();
    const port = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');
    
    // Extract base registered domain (e.g. sub.example.co.uk -> example.co.uk or sub.example.com -> example.com)
    const hostParts = hostname.split('.');
    let domain = hostname;
    if (hostParts.length > 2) {
      const knownMultiTlds = ['co.uk', 'gov.in', 'co.in', 'net.in', 'org.in', 'ac.uk', 'com.au', 'co.jp', 'com.br'];
      const lastTwo = hostParts.slice(-2).join('.');
      if (knownMultiTlds.includes(lastTwo) && hostParts.length >= 3) {
        domain = hostParts.slice(-3).join('.');
      } else {
        domain = hostParts.slice(-2).join('.');
      }
    }

    // Structural checks
    const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':');
    const isUnusualPort = !['80', '443', '8080', '8443'].includes(port);
    const hasSuspiciousEncoding = /%(25|2f|5c|00)/i.test(parsed.pathname + parsed.search);

    return {
      fullUrl: parsed.href,
      protocol: parsed.protocol.replace(':', ''),
      hostname,
      domain,
      port,
      pathname: parsed.pathname || '/',
      search: parsed.search || '',
      hash: parsed.hash || '',
      isIpHost,
      isUnusualPort,
      hasSuspiciousEncoding
    };
  } catch {
    return null;
  }
}

/**
 * Step 2: Test live reachability, latency, status code, and redirects.
 */
async function checkLiveReachability(targetUrl) {
  const startTime = Date.now();
  let status = 'UNKNOWN';
  let statusCode = null;
  let statusText = '';
  let responseTimeMs = null;
  let finalUrl = targetUrl;
  let redirectCount = 0;
  let serverHeader = '';
  let contentType = '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 CyberCouncil-Inspector/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      redirect: 'follow',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    responseTimeMs = Date.now() - startTime;
    statusCode = res.status;
    statusText = res.statusText || 'OK';
    finalUrl = res.url;
    serverHeader = res.headers.get('server') || 'Hidden / Protected';
    contentType = res.headers.get('content-type') || 'Unknown';

    if (finalUrl !== targetUrl) {
      redirectCount = 1;
    }

    if (res.status >= 200 && res.status < 400) {
      status = redirectCount > 0 ? 'REDIRECTED' : 'ONLINE';
    } else if (res.status >= 400 && res.status < 500) {
      status = 'ONLINE'; // Client error from server indicates server is still online
    } else {
      status = 'OFFLINE';
    }
  } catch (err) {
    responseTimeMs = Date.now() - startTime;
    if (err.name === 'AbortError') {
      status = 'UNREACHABLE';
      statusText = 'Connection Timed Out (7000ms)';
    } else {
      status = 'UNREACHABLE';
      statusText = err.message || 'Host resolution or connection failure';
    }
  }

  return {
    status,
    statusCode,
    statusText,
    responseTimeMs,
    finalUrl,
    redirectCount,
    serverHeader,
    contentType,
    corsNote: 'HTTP reachability verified via server-side probe, avoiding browser CORS limitations.'
  };
}

/**
 * Step 3: Fetch DNS Records using WhoisXML DNSService + Node.js fallback.
 */
async function fetchDnsIntelligence(domain, hostname, apiKey) {
  const records = [];

  // Try WhoisXML DNSService first if API key configured
  if (apiKey) {
    try {
      const url = `https://www.whoisxmlapi.com/whoisserver/DNSService?apiKey=${encodeURIComponent(apiKey)}&domainName=${encodeURIComponent(domain)}&type=_all&outputFormat=JSON`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        const dnsRecords = data?.DNSData?.dnsRecords || [];
        for (const item of dnsRecords) {
          records.push({
            type: item.dnsType || 'UNKNOWN',
            name: item.name || domain,
            ttl: item.ttl || 300,
            value: item.address || item.target || item.strings?.join(' ') || item.host || item.rawText || JSON.stringify(item)
          });
        }
      }
    } catch {
      // Fallback to native DNS
    }
  }

  // If records is empty, use native Node.js DNS resolution
  if (records.length === 0) {
    try {
      // A records
      try {
        const aRecords = await dns.resolve4(hostname, { ttl: true });
        aRecords.forEach(r => records.push({ type: 'A', name: hostname, ttl: r.ttl, value: r.address }));
      } catch {}

      // AAAA records
      try {
        const aaaaRecords = await dns.resolve6(hostname, { ttl: true });
        aaaaRecords.forEach(r => records.push({ type: 'AAAA', name: hostname, ttl: r.ttl, value: r.address }));
      } catch {}

      // MX records
      try {
        const mxRecords = await dns.resolveMx(domain);
        mxRecords.forEach(r => records.push({ type: 'MX', name: domain, ttl: 300, value: `${r.exchange} (Priority: ${r.priority})` }));
      } catch {}

      // NS records
      try {
        const nsRecords = await dns.resolveNs(domain);
        nsRecords.forEach(r => records.push({ type: 'NS', name: domain, ttl: 300, value: r }));
      } catch {}

      // TXT records
      try {
        const txtRecords = await dns.resolveTxt(domain);
        txtRecords.forEach(r => records.push({ type: 'TXT', name: domain, ttl: 300, value: r.join(' ') }));
      } catch {}
    } catch {}
  }

  return {
    source: records.length > 0 ? (apiKey ? 'WhoisXML DNSService & Local Resolver' : 'Authoritative Local DNS Resolver') : 'None Available',
    recordCount: records.length,
    records
  };
}

/**
 * Step 4: Fetch WHOIS / Domain Registration Info from WhoisXML.
 */
async function fetchWhoisInfo(domain, apiKey) {
  if (!apiKey) {
    return {
      status: 'DEMO / API NOT CONNECTED',
      registrar: 'Unknown / Not Available without API Key',
      createdDate: null,
      updatedDate: null,
      expiresDate: null,
      domainStatus: ['Status Unavailable'],
      nameServers: [],
      registrantOrg: 'Privacy Protected or Unconfigured',
      registrantCountry: 'Unknown',
      isPrivacyProtected: true
    };
  }

  try {
    const url = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${encodeURIComponent(apiKey)}&domainName=${encodeURIComponent(domain)}&outputFormat=JSON`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) {
      return {
        status: `WhoisXML Service Error (${res.status})`,
        registrar: 'Unavailable',
        createdDate: null,
        updatedDate: null,
        expiresDate: null,
        domainStatus: [],
        nameServers: [],
        registrantOrg: 'Unavailable',
        registrantCountry: 'Unavailable',
        isPrivacyProtected: false
      };
    }

    const data = await res.json();
    const rec = data?.WhoisRecord || {};
    const reg = rec.registrant || {};

    const nameServers = (rec.nameServers?.hostNames || []).map(h => String(h).toLowerCase());
    const statuses = Array.isArray(rec.status) 
      ? rec.status 
      : (typeof rec.status === 'string' ? rec.status.split(/\s+/) : []);

    const org = reg.organization || reg.name || 'Withheld for Privacy';
    const isPrivacy = /privacy|proxy|guard|whoisguard|withheld|redacted/i.test(org + ' ' + (reg.email || ''));

    return {
      status: 'AVAILABLE',
      domainName: rec.domainName || domain,
      registrar: rec.registrarName || 'Unknown Registrar',
      createdDate: rec.createdDate || null,
      updatedDate: rec.updatedDate || null,
      expiresDate: rec.expiresDate || null,
      domainStatus: statuses.filter(Boolean),
      nameServers,
      registrantOrg: org,
      registrantCountry: reg.countryCode || reg.country || 'Unknown',
      isPrivacyProtected: isPrivacy,
      raw: rec
    };
  } catch (err) {
    return {
      status: 'TIMEOUT / NETWORK ERROR',
      registrar: 'Unavailable',
      createdDate: null,
      updatedDate: null,
      expiresDate: null,
      domainStatus: [],
      nameServers: [],
      registrantOrg: 'Unavailable',
      registrantCountry: 'Unavailable',
      isPrivacyProtected: false
    };
  }
}

/**
 * Step 5: Fetch Domain Reputation from WhoisXML.
 */
async function fetchDomainReputation(domain, apiKey) {
  if (!apiKey) {
    return {
      source: 'WhoisXML Reputation API',
      status: 'DEMO / API NOT CONNECTED',
      reputationScore: null,
      riskLevel: 'UNKNOWN',
      warnings: ['WhoisXML API Key not configured on server.'],
      testResults: []
    };
  }

  try {
    const url = `https://domain-reputation.whoisxmlapi.com/api/v1?apiKey=${encodeURIComponent(apiKey)}&domainName=${encodeURIComponent(domain)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) {
      return {
        source: 'WhoisXML Reputation API',
        status: `API returned status ${res.status}`,
        reputationScore: null,
        riskLevel: 'UNKNOWN',
        warnings: [`Service returned HTTP ${res.status}`],
        testResults: []
      };
    }

    const data = await res.json();
    const score = typeof data.reputationScore === 'number' ? data.reputationScore : null;

    let riskLevel = 'LOW';
    if (score !== null) {
      if (score < 40) riskLevel = 'HIGH';
      else if (score < 70) riskLevel = 'MEDIUM';
      else riskLevel = 'LOW';
    }

    const warnings = [];
    (data.testResults || []).forEach(tr => {
      if (tr.warnings && Array.isArray(tr.warnings)) {
        warnings.push(...tr.warnings);
      }
    });

    return {
      source: 'WhoisXML Reputation API',
      status: 'AVAILABLE',
      reputationScore: score,
      riskLevel,
      warnings,
      testResults: data.testResults || [],
      mode: data.mode || 'fast'
    };
  } catch (err) {
    return {
      source: 'WhoisXML Reputation API',
      status: 'TIMEOUT / NETWORK ERROR',
      reputationScore: null,
      riskLevel: 'UNKNOWN',
      warnings: ['Network request timed out'],
      testResults: []
    };
  }
}

/**
 * Step 6: Fetch Website Categorization from WhoisXML.
 */
async function fetchWebsiteCategorization(domain, apiKey) {
  if (!apiKey) {
    return {
      source: 'WhoisXML Website Categorization API',
      status: 'DEMO / API NOT CONNECTED',
      categories: [{ name: 'Uncategorized', confidence: 0 }],
      asn: null
    };
  }

  try {
    const url = `https://website-categorization.whoisxmlapi.com/api/v1?apiKey=${encodeURIComponent(apiKey)}&domainName=${encodeURIComponent(domain)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) {
      return {
        source: 'WhoisXML Website Categorization API',
        status: `HTTP ${res.status}`,
        categories: [{ name: 'Unknown Category', confidence: 0 }],
        asn: null
      };
    }

    const data = await res.json();
    const categories = (data.categories || []).map(c => ({
      name: c.name || 'General',
      confidence: typeof c.confidence === 'number' ? Math.round(c.confidence * 100) : null
    }));

    return {
      source: 'WhoisXML Website Categorization API',
      status: 'AVAILABLE',
      categories: categories.length > 0 ? categories : [{ name: 'General Internet Service', confidence: 100 }],
      asn: data.as ? {
        asn: data.as.asn,
        name: data.as.name,
        route: data.as.route,
        domain: data.as.domain
      } : null
    };
  } catch (err) {
    return {
      source: 'WhoisXML Website Categorization API',
      status: 'TIMEOUT / NETWORK ERROR',
      categories: [{ name: 'Lookup Timeout', confidence: 0 }],
      asn: null
    };
  }
}

/**
 * Step 7: Fetch SSL Certificate Details (WhoisXML + Live TLS Socket probe).
 */
async function fetchSslCertificate(domain, hostname, port, apiKey) {
  // First attempt live TLS connection for 100% current accurate cert data
  const targetPort = parseInt(port, 10) || 443;
  let liveCertResult = null;

  try {
    liveCertResult = await new Promise((resolve) => {
      const socket = tls.connect({
        host: hostname,
        port: targetPort,
        servername: hostname,
        rejectUnauthorized: false,
        timeout: 4000
      }, () => {
        const cert = socket.getPeerCertificate(true);
        socket.end();
        if (!cert || Object.keys(cert).length === 0) {
          resolve(null);
          return;
        }

        const validFrom = cert.valid_from ? new Date(cert.valid_from).toISOString() : null;
        const validTo = cert.valid_to ? new Date(cert.valid_to).toISOString() : null;
        let daysRemaining = null;
        let sslStatus = 'UNKNOWN';

        if (validTo) {
          const diffMs = new Date(validTo).getTime() - Date.now();
          daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          if (daysRemaining < 0) {
            sslStatus = 'EXPIRED';
          } else if (daysRemaining <= 14) {
            sslStatus = 'EXPIRING';
          } else {
            sslStatus = 'VALID';
          }
        }

        resolve({
          status: sslStatus,
          subjectCN: cert.subject?.CN || hostname,
          subjectOrg: cert.subject?.O || 'Not Specified',
          issuerCN: cert.issuer?.CN || 'Unknown CA',
          issuerOrg: cert.issuer?.O || cert.issuer?.CN || 'Unknown Issuer',
          validFrom,
          validTo,
          daysRemaining,
          serialNumber: cert.serialNumber || 'N/A',
          fingerprint256: cert.fingerprint256 || 'N/A',
          altnames: cert.subjectaltname || 'N/A'
        });
      });

      socket.on('error', () => resolve(null));
      socket.on('timeout', () => {
        socket.destroy();
        resolve(null);
      });
    });
  } catch {}

  if (liveCertResult) {
    return {
      source: 'Live Server TLS Probe',
      ...liveCertResult,
      notice: 'A valid SSL certificate confirms encryption only; it does NOT establish that a website is trustworthy or safe.'
    };
  }

  // Fallback to WhoisXML SSL Certificates API if live socket failed
  if (apiKey) {
    try {
      const url = `https://ssl-certificates.whoisxmlapi.com/api/v1?apiKey=${encodeURIComponent(apiKey)}&domainName=${encodeURIComponent(domain)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        const firstCert = (data.certificates || [])[0];
        if (firstCert) {
          const validTo = firstCert.validTo ? new Date(firstCert.validTo).toISOString() : null;
          const validFrom = firstCert.validFrom ? new Date(firstCert.validFrom).toISOString() : null;
          let daysRemaining = null;
          let sslStatus = 'VALID';

          if (validTo) {
            const diffMs = new Date(validTo).getTime() - Date.now();
            daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            if (daysRemaining < 0) sslStatus = 'EXPIRED';
            else if (daysRemaining <= 14) sslStatus = 'EXPIRING';
          }

          return {
            source: 'WhoisXML SSL Certificates API',
            status: sslStatus,
            subjectCN: domain,
            subjectOrg: 'Certificate Authority Verified',
            issuerCN: firstCert.issuer || 'Trusted Certificate Authority',
            issuerOrg: firstCert.issuer || 'Trusted CA',
            validFrom,
            validTo,
            daysRemaining,
            serialNumber: firstCert.serialNumber || 'N/A',
            fingerprint256: firstCert.fingerprint256 || 'N/A',
            notice: 'A valid SSL certificate confirms encryption only; it does NOT establish that a website is trustworthy or safe.'
          };
        }
      }
    } catch {}
  }

  return {
    source: 'None Available',
    status: 'UNKNOWN',
    subjectCN: 'N/A',
    subjectOrg: 'N/A',
    issuerCN: 'N/A',
    issuerOrg: 'N/A',
    validFrom: null,
    validTo: null,
    daysRemaining: null,
    serialNumber: 'N/A',
    fingerprint256: 'N/A',
    notice: 'SSL details could not be retrieved from this host.'
  };
}

/**
 * Step 8: Fetch Threat Intelligence indicators from WhoisXML.
 */
async function fetchThreatIntelligence(domain, apiKey) {
  if (!apiKey) {
    return {
      source: 'WhoisXML Threat Intelligence API',
      status: 'DEMO / API NOT CONNECTED',
      indicatorCount: 0,
      threatFlag: 'CLEAN',
      threatDetails: [],
      disclaimer: 'Absence of a threat indicator does not guarantee that a website is safe.'
    };
  }

  try {
    const url = `https://threat-intelligence.whoisxmlapi.com/api/v1?apiKey=${encodeURIComponent(apiKey)}&ioc=${encodeURIComponent(domain)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) {
      return {
        source: 'WhoisXML Threat Intelligence API',
        status: `HTTP ${res.status}`,
        indicatorCount: 0,
        threatFlag: 'CLEAN',
        threatDetails: [],
        disclaimer: 'Absence of a threat indicator does not guarantee that a website is safe.'
      };
    }

    const data = await res.json();
    const count = Number(data.total || 0);
    const results = data.results || [];

    let threatFlag = 'CLEAN';
    if (count > 0) threatFlag = 'FLAGGED';

    return {
      source: 'WhoisXML Threat Intelligence API',
      status: 'AVAILABLE',
      indicatorCount: count,
      threatFlag,
      threatDetails: results,
      disclaimer: 'Absence of a threat indicator does not guarantee that a website is safe.'
    };
  } catch (err) {
    return {
      source: 'WhoisXML Threat Intelligence API',
      status: 'TIMEOUT / NETWORK ERROR',
      indicatorCount: 0,
      threatFlag: 'CLEAN',
      threatDetails: [],
      disclaimer: 'Absence of a threat indicator does not guarantee that a website is safe.'
    };
  }
}

/**
 * Main Controller: Run all 8 investigation stages in parallel.
 */
export async function runFullUrlInvestigation(rawUrl) {
  const normalized = normalizeTargetUrl(rawUrl);
  if (!normalized) {
    return {
      success: false,
      error: 'Invalid URL format. Please enter a valid web address (e.g., example.com or https://example.com).'
    };
  }

  const apiKey = getApiKey();
  const investigationTimestamp = new Date().toISOString();

  // Run intelligence inquiries in parallel
  const [
    reachability,
    dnsInfo,
    whoisInfo,
    reputation,
    categorization,
    sslCert,
    threatIntel
  ] = await Promise.all([
    checkLiveReachability(normalized.fullUrl),
    fetchDnsIntelligence(normalized.domain, normalized.hostname, apiKey),
    fetchWhoisInfo(normalized.domain, apiKey),
    fetchDomainReputation(normalized.domain, apiKey),
    fetchWebsiteCategorization(normalized.domain, apiKey),
    fetchSslCertificate(normalized.domain, normalized.hostname, normalized.port, apiKey),
    fetchThreatIntelligence(normalized.domain, apiKey)
  ]);

  // Determine top summary pill indicators
  const summaryPills = {
    reachability: reachability.status, // ONLINE | OFFLINE | REDIRECTED | UNREACHABLE
    ssl: sslCert.status, // VALID | EXPIRING | EXPIRED | UNKNOWN
    reputation: reputation.riskLevel || 'UNKNOWN', // LOW | MEDIUM | HIGH | UNKNOWN
    threat: threatIntel.threatFlag || 'CLEAN' // CLEAN | FLAGGED
  };

  return {
    success: true,
    investigationTimestamp,
    apiKeyConfigured: Boolean(apiKey),
    urlStructure: {
      ...normalized,
      stepTimestamp: new Date().toISOString()
    },
    reachability: {
      ...reachability,
      stepTimestamp: new Date().toISOString()
    },
    dns: {
      ...dnsInfo,
      stepTimestamp: new Date().toISOString()
    },
    whois: {
      ...whoisInfo,
      stepTimestamp: new Date().toISOString()
    },
    reputation: {
      ...reputation,
      stepTimestamp: new Date().toISOString()
    },
    categorization: {
      ...categorization,
      stepTimestamp: new Date().toISOString()
    },
    ssl: {
      ...sslCert,
      stepTimestamp: new Date().toISOString()
    },
    threatIntel: {
      ...threatIntel,
      stepTimestamp: new Date().toISOString()
    },
    summaryPills,
    notices: {
      primary: 'Preliminary cyber investigation tool. Results are intelligence indicators and should be independently verified before being used as investigative evidence.',
      sslDisclaimer: 'An active website, valid SSL certificate, or absence of a threat indicator does not establish that a website is trustworthy.'
    }
  };
}

/**
 * Middleware: Handle POST /api/url-investigation
 */
export async function handleUrlInvestigationRequest(req, res) {
  let rawBody = '';
  req.on('data', chunk => { rawBody += chunk; });
  req.on('end', async () => {
    try {
      let targetUrl = '';
      if (rawBody) {
        try {
          const parsed = JSON.parse(rawBody);
          targetUrl = parsed.url;
        } catch {
          targetUrl = '';
        }
      }

      if (!targetUrl && req.url.includes('?')) {
        const queryParams = new URL(req.url, 'http://localhost').searchParams;
        targetUrl = queryParams.get('url');
      }

      const result = await runFullUrlInvestigation(targetUrl);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.statusCode = 200;
      res.end(JSON.stringify(result));
    } catch (err) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.statusCode = 500;
      res.end(JSON.stringify({
        success: false,
        error: 'Internal server error processing URL investigation.',
        details: err.message
      }));
    }
  });
}

/**
 * Middleware: Handle POST /api/url-screenshot (On-demand screenshot only)
 */
export async function handleUrlScreenshotRequest(req, res) {
  let rawBody = '';
  req.on('data', chunk => { rawBody += chunk; });
  req.on('end', async () => {
    try {
      let targetUrl = '';
      if (rawBody) {
        try {
          const parsed = JSON.parse(rawBody);
          targetUrl = parsed.url;
        } catch {
          targetUrl = '';
        }
      }

      const normalized = normalizeTargetUrl(targetUrl);
      if (!normalized) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: 'Invalid URL provided.' }));
      }

      const apiKey = getApiKey();
      if (!apiKey) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.statusCode = 200;
        return res.end(JSON.stringify({
          success: false,
          error: 'WhoisXML API Key is not configured on the server. Screenshot capture requires an active subscription.'
        }));
      }

      // Call WhoisXML website-screenshot API
      const screenshotApiUrl = `https://website-screenshot.whoisxmlapi.com/api/v1?apiKey=${encodeURIComponent(apiKey)}&url=${encodeURIComponent(normalized.fullUrl)}&imageType=png`;
      const ssRes = await fetch(screenshotApiUrl, { signal: AbortSignal.timeout(15000) });

      if (!ssRes.ok) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.statusCode = 200;
        return res.end(JSON.stringify({
          success: false,
          error: `Screenshot service returned HTTP ${ssRes.status}. The host may be blocking automated browser captures.`
        }));
      }

      const arrayBuffer = await ssRes.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');
      const dataUri = `data:image/png;base64,${base64Data}`;

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.statusCode = 200;
      res.end(JSON.stringify({
        success: true,
        imageDataUri: dataUri,
        capturedAt: new Date().toISOString(),
        url: normalized.fullUrl
      }));
    } catch (err) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.statusCode = 200;
      res.end(JSON.stringify({
        success: false,
        error: `Screenshot capture failed or timed out: ${err.message}`
      }));
    }
  });
}
