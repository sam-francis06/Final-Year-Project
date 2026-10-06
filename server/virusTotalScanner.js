/**
 * CyberCouncil - Server-Side VirusTotal API v3 Threat Verification Handler
 * 
 * Secure backend verification module that interfaces with VirusTotal API v3.
 * Security guarantees:
 * - VIRUSTOTAL_API_KEY is read strictly from process.env and never logged, printed, or sent to client.
 * - Standardized citizen-friendly verdicts: 'Unsafe Website', 'Be Careful', 'No Threat Detected', 'Verification Unavailable'.
 * - Preserves safety disclaimers (0 detections != 100% safe).
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

// Attempt to load .env securely if not already loaded in Node environment
try {
  const envPath = resolve(process.cwd(), '.env');
  if (existsSync(envPath) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(envPath);
  }
} catch {
  // Ignore env loading errors silently
}

const VT_BASE_URL = 'https://www.virustotal.com/api/v3';
const MAX_POLL_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 2000;

/**
 * Safely retrieve the VirusTotal API key from the environment.
 */
function getApiKey() {
  return process.env.VIRUSTOTAL_API_KEY ? process.env.VIRUSTOTAL_API_KEY.trim() : '';
}

/**
 * Validate and normalize a candidate URL.
 */
function sanitizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let formatted = rawUrl.trim();
  if (!formatted) return null;
  if (!/^https?:\/\//i.test(formatted)) {
    formatted = 'https://' + formatted;
  }
  try {
    const parsed = new URL(formatted);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Format raw VirusTotal stats & engine results into normalized citizen output.
 */
function normalizeVtResults(statsData, resultsData, scanDate) {
  const stats = {
    malicious: Number(statsData?.malicious || 0),
    suspicious: Number(statsData?.suspicious || 0),
    harmless: Number(statsData?.harmless || 0),
    undetected: Number(statsData?.undetected || 0),
    timeout: Number(statsData?.timeout || 0)
  };

  const totalEngines = stats.malicious + stats.suspicious + stats.harmless + stats.undetected + stats.timeout;

  // Extract names of engines that reported threats
  const flaggedEngines = [];
  if (resultsData && typeof resultsData === 'object') {
    for (const [engineName, details] of Object.entries(resultsData)) {
      if (details?.category === 'malicious' || details?.category === 'suspicious') {
        flaggedEngines.push({
          name: details.engine_name || engineName,
          category: details.category,
          result: details.result || details.category
        });
      }
    }
  }

  // Synthesize citizen-friendly verdict
  let verdict = 'No Threat Detected';
  let message = 'VirusTotal did not detect malicious indicators in the available security results.';
  const disclaimer = 'Zero detections do not guarantee that a website is safe.';

  if (stats.malicious >= 2) {
    verdict = 'Unsafe Website';
    message = `VirusTotal detected this URL as malicious by ${stats.malicious} security engines.`;
  } else if (stats.malicious === 1 || stats.suspicious >= 1) {
    verdict = 'Be Careful';
    message = stats.malicious === 1
      ? 'VirusTotal reported 1 security engine detecting this URL as malicious.'
      : `VirusTotal reported ${stats.suspicious} security engine(s) detecting suspicious activity.`;
  }

  let timestampStr = '';
  if (scanDate) {
    try {
      const d = typeof scanDate === 'number' ? new Date(scanDate * 1000) : new Date(scanDate);
      timestampStr = d.toISOString();
    } catch {
      timestampStr = new Date().toISOString();
    }
  } else {
    timestampStr = new Date().toISOString();
  }

  return {
    success: true,
    verdict,
    message,
    disclaimer: verdict === 'No Threat Detected' ? disclaimer : null,
    stats,
    totalEngines,
    flaggedEngines,
    scanTimestamp: timestampStr,
    source: 'VirusTotal v3'
  };
}

/**
 * Scan a URL using VirusTotal API v3.
 */
export async function scanUrlWithVirusTotal(targetUrl) {
  const normalizedUrl = sanitizeUrl(targetUrl);
  if (!normalizedUrl) {
    return {
      success: false,
      verdict: 'Verification Unavailable',
      message: 'The submitted web address is malformed or invalid.',
      stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
      flaggedEngines: [],
      source: 'VirusTotal v3'
    };
  }

  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'your_virustotal_api_key_here') {
    return {
      success: false,
      verdict: 'Verification Unavailable',
      message: 'VirusTotal API key is not configured on the server. Please set VIRUSTOTAL_API_KEY in the server environment (.env).',
      stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
      flaggedEngines: [],
      source: 'VirusTotal v3'
    };
  }

  // Generate URL identifier: unpadded base64url
  const urlId = Buffer.from(normalizedUrl).toString('base64url');

  // Step 1: Check existing URL report cache
  try {
    const existingRes = await fetch(`${VT_BASE_URL}/urls/${urlId}`, {
      method: 'GET',
      headers: {
        'x-apikey': apiKey,
        'Accept': 'application/json'
      }
    });

    if (existingRes.status === 200) {
      const existingData = await existingRes.json();
      const attributes = existingData?.data?.attributes;
      if (attributes?.last_analysis_stats) {
        return normalizeVtResults(
          attributes.last_analysis_stats,
          attributes.last_analysis_results,
          attributes.last_analysis_date
        );
      }
    } else if (existingRes.status === 429) {
      return {
        success: false,
        verdict: 'Verification Unavailable',
        message: 'VirusTotal API rate limit reached (public quota is 4 requests per minute). Please wait a moment and try again.',
        stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
        flaggedEngines: [],
        source: 'VirusTotal v3'
      };
    } else if (existingRes.status === 401) {
      return {
        success: false,
        verdict: 'Verification Unavailable',
        message: 'Invalid VirusTotal API key configured on server. Please verify VIRUSTOTAL_API_KEY.',
        stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
        flaggedEngines: [],
        source: 'VirusTotal v3'
      };
    }
  } catch {
    // Network failure when querying report, proceed to submission or fallback
  }

  // Step 2: Submit URL for fresh scanning
  let analysisId = null;
  try {
    const submitRes = await fetch(`${VT_BASE_URL}/urls`, {
      method: 'POST',
      headers: {
        'x-apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: `url=${encodeURIComponent(normalizedUrl)}`
    });

    if (submitRes.status === 429) {
      return {
        success: false,
        verdict: 'Verification Unavailable',
        message: 'VirusTotal API rate limit reached. Please wait a moment and try again.',
        stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
        flaggedEngines: [],
        source: 'VirusTotal v3'
      };
    }

    if (!submitRes.ok) {
      return {
        success: false,
        verdict: 'Verification Unavailable',
        message: 'Unable to submit website for analysis to VirusTotal.',
        stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
        flaggedEngines: [],
        source: 'VirusTotal v3'
      };
    }

    const submitData = await submitRes.json();
    analysisId = submitData?.data?.id;
  } catch {
    return {
      success: false,
      verdict: 'Verification Unavailable',
      message: 'Network connection failure while contacting VirusTotal servers.',
      stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
      flaggedEngines: [],
      source: 'VirusTotal v3'
    };
  }

  if (!analysisId) {
    return {
      success: false,
      verdict: 'Verification Unavailable',
      message: 'VirusTotal did not return a valid analysis reference.',
      stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
      flaggedEngines: [],
      source: 'VirusTotal v3'
    };
  }

  // Step 3: Poll analysis status until completed (approx 2s interval, max 10s timeout)
  for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    try {
      const pollRes = await fetch(`${VT_BASE_URL}/analyses/${analysisId}`, {
        method: 'GET',
        headers: {
          'x-apikey': apiKey,
          'Accept': 'application/json'
        }
      });

      if (pollRes.status === 200) {
        const pollData = await pollRes.json();
        const attrs = pollData?.data?.attributes;
        if (attrs?.status === 'completed') {
          return normalizeVtResults(attrs.stats, attrs.results, attrs.date);
        }
      } else if (pollRes.status === 429) {
        return {
          success: false,
          verdict: 'Verification Unavailable',
          message: 'VirusTotal rate limit encountered while polling analysis.',
          stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
          flaggedEngines: [],
          source: 'VirusTotal v3'
        };
      }
    } catch {
      // Continue next attempt
    }
  }

  // Timeout reached and analysis still pending
  return {
    success: false,
    verdict: 'Verification Unavailable',
    message: 'VirusTotal is still processing this URL. Please try again shortly.',
    stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
    flaggedEngines: [],
    source: 'VirusTotal v3'
  };
}

/**
 * HTTP Middleware handler for POST /api/scan-url.
 */
export async function handleScanUrlRequest(req, res) {
  // Read request body
  let rawBody = '';
  req.on('data', (chunk) => {
    rawBody += chunk;
  });

  req.on('end', async () => {
    try {
      let targetUrl = '';
      if (rawBody) {
        try {
          const parsed = JSON.parse(rawBody);
          targetUrl = parsed.url;
        } catch {
          // If body is not JSON, check URL query
          targetUrl = '';
        }
      }

      if (!targetUrl && req.url.includes('?')) {
        const queryParams = new URL(req.url, 'http://localhost').searchParams;
        targetUrl = queryParams.get('url');
      }

      const scanResult = await scanUrlWithVirusTotal(targetUrl);

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.statusCode = 200;
      res.end(JSON.stringify(scanResult));
    } catch (err) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.statusCode = 200;
      res.end(JSON.stringify({
        success: false,
        verdict: 'Verification Unavailable',
        message: 'Internal server error processing URL threat verification.',
        stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
        flaggedEngines: [],
        source: 'VirusTotal v3'
      }));
    }
  });
}

const MAX_FILE_POLL_ATTEMPTS = 5;
const FILE_POLL_INTERVAL_MS = 2000;
export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB Upload Limit

export const SUPPORTED_FILE_EXTENSIONS = [
  'exe', 'dll', 'msi', 'apk', 'jar', 'zip', 'rar',
  'doc', 'docx', 'xls', 'xlsx', 'pdf', 'js', 'ps1', 'bat', 'cmd', 'scr'
];

/**
 * Format raw VirusTotal stats & engine results for file scans into citizen-friendly output.
 */
function normalizeVtFileResults(statsData, resultsData, scanDate, fileMeta = {}) {
  let maliciousCount = 0;
  let suspiciousCount = 0;
  let harmlessCount = 0;
  let undetectedCount = 0;
  let timeoutCount = 0;

  // Extract names and details of engines that flagged the file
  const flaggedEngines = [];
  if (resultsData && typeof resultsData === 'object') {
    for (const [engineName, details] of Object.entries(resultsData)) {
      const cat = details?.category;
      if (cat === 'malicious') {
        maliciousCount++;
        flaggedEngines.push({
          name: details.engine_name || engineName,
          category: 'malicious',
          result: details.result || 'Malicious',
          method: details.method || null
        });
      } else if (cat === 'suspicious') {
        suspiciousCount++;
        flaggedEngines.push({
          name: details.engine_name || engineName,
          category: 'suspicious',
          result: details.result || 'Suspicious',
          method: details.method || null
        });
      } else if (cat === 'harmless') {
        harmlessCount++;
      } else if (cat === 'undetected') {
        undetectedCount++;
      } else if (cat === 'timeout') {
        timeoutCount++;
      }
    }
  }

  const rawUndetected = Number(statsData?.undetected || 0);
  const stats = {
    malicious: Number(statsData?.malicious ?? maliciousCount),
    suspicious: Number(statsData?.suspicious ?? suspiciousCount),
    harmless: Number(statsData?.harmless ?? harmlessCount),
    undetected: rawUndetected > 0 ? rawUndetected : (undetectedCount > 0 ? undetectedCount : 0),
    timeout: Number(statsData?.timeout || timeoutCount)
  };

  const totalEngines = stats.malicious + stats.suspicious + stats.harmless + stats.undetected + stats.timeout;

  // Synthesize citizen-friendly verdicts & risk levels
  let verdict = 'No Threat Detected';
  let riskLevel = 'Low Risk';
  let message = totalEngines > 0
    ? `Analyzed across ${totalEngines} security engines: 0 threats detected.`
    : 'VirusTotal did not detect malicious indicators in the available security results.';
  let guidance = 'No malicious signatures were flagged by security engines. Zero detections do not guarantee that a file is completely safe.';
  const disclaimer = 'Zero detections do not guarantee that a file is completely safe.';

  if (stats.malicious >= 2) {
    verdict = 'Unsafe / Malicious File';
    riskLevel = 'High Risk';
    message = `VirusTotal detected this file as malicious by ${stats.malicious} security engines.`;
    guidance = 'Multiple security engines identified this file as malicious. Do not open or execute the file. Remove or quarantine it using trusted security software.';
  } else if (stats.malicious === 1 || stats.suspicious >= 1) {
    verdict = 'Suspicious File';
    riskLevel = 'Medium Risk';
    message = stats.suspicious > 0 && stats.malicious > 0
      ? `VirusTotal flagged ${stats.malicious} malicious and ${stats.suspicious} suspicious detection(s).`
      : 'VirusTotal reported suspicious indicators for this file.';
    guidance = 'One or more security engines identified suspicious or potentially malicious characteristics. Avoid opening or executing this file until it has been independently verified.';
  }

  let timestampStr = '';
  if (scanDate) {
    try {
      const d = typeof scanDate === 'number' ? new Date(scanDate * 1000) : new Date(scanDate);
      timestampStr = d.toISOString();
    } catch {
      timestampStr = new Date().toISOString();
    }
  } else {
    timestampStr = new Date().toISOString();
  }

  const detections = flaggedEngines.map((e) => ({
    engine: e.name,
    detection: e.result || e.category,
    category: e.category
  }));

  const fileInfo = {
    name: fileMeta.name || (fileMeta.names && fileMeta.names[0]) || 'Unknown',
    size: fileMeta.size || 0,
    mimeType: fileMeta.mimeType || fileMeta.typeDescription || 'application/octet-stream',
    sha256: fileMeta.sha256 || '',
    sha1: fileMeta.sha1 || '',
    md5: fileMeta.md5 || ''
  };

  return {
    success: true,
    notFound: false,
    verdict,
    riskLevel,
    message,
    guidance,
    disclaimer: verdict === 'No Threat Detected' ? disclaimer : null,
    stats,
    totalEngines,
    detections,
    flaggedEngines,
    file: fileInfo,
    fileMeta: {
      sha256: fileMeta.sha256 || '',
      sha1: fileMeta.sha1 || '',
      md5: fileMeta.md5 || '',
      size: fileMeta.size || 0,
      typeDescription: fileMeta.typeDescription || '',
      names: Array.isArray(fileMeta.names) ? fileMeta.names : []
    },
    analysis: {
      status: 'completed',
      timestamp: timestampStr
    },
    scanTimestamp: timestampStr,
    source: 'VirusTotal v3'
  };
}

/**
 * Perform a hash-first lookup against VirusTotal API v3.
 * Query: GET /files/{sha256}
 */
export async function scanFileHashWithVirusTotal(sha256, originalFileName = '') {
  if (!sha256 || typeof sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(sha256.trim())) {
    return {
      success: false,
      notFound: false,
      verdict: 'Verification Unavailable',
      message: 'Invalid SHA-256 hash. SHA-256 must be exactly 64 hexadecimal characters.',
      stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
      flaggedEngines: [],
      source: 'VirusTotal v3'
    };
  }

  const cleanHash = sha256.trim().toLowerCase();
  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'your_virustotal_api_key_here') {
    return {
      success: false,
      notFound: false,
      verdict: 'Verification Unavailable',
      message: 'VirusTotal API key is not configured on the server. Please check VIRUSTOTAL_API_KEY in .env.',
      stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
      flaggedEngines: [],
      source: 'VirusTotal v3'
    };
  }

  try {
    const res = await fetch(`${VT_BASE_URL}/files/${cleanHash}`, {
      method: 'GET',
      headers: {
        'x-apikey': apiKey,
        'Accept': 'application/json'
      }
    });

    if (res.status === 200) {
      const data = await res.json();
      const attr = data?.data?.attributes || {};

      // Resolve legitimate filename: prioritize originalFileName, then match type_description with known names
      let resolvedName = originalFileName || '';
      if (!resolvedName && Array.isArray(attr.names) && attr.names.length > 0) {
        const typeDesc = (attr.type_description || '').toLowerCase();
        const matchedName = attr.names.find((n) => {
          if (typeDesc.includes('spreadsheet') || typeDesc.includes('excel')) return /\.(xlsx?|csv)$/i.test(n);
          if (typeDesc.includes('word') || typeDesc.includes('document')) return /\.(docx?|rtf)$/i.test(n);
          if (typeDesc.includes('pdf')) return /\.pdf$/i.test(n);
          if (typeDesc.includes('executable') || typeDesc.includes('win32') || typeDesc.includes('pe32')) return /\.(exe|dll)$/i.test(n);
          return false;
        });
        resolvedName = matchedName || attr.names[0];
      }

      return normalizeVtFileResults(
        attr.last_analysis_stats,
        attr.last_analysis_results,
        attr.last_analysis_date,
        {
          name: resolvedName,
          sha256: attr.sha256 || cleanHash,
          sha1: attr.sha1 || '',
          md5: attr.md5 || '',
          size: attr.size || 0,
          typeDescription: attr.type_description || '',
          names: resolvedName ? [resolvedName, ...(attr.names || [])] : (attr.names || [])
        }
      );
    }

    if (res.status === 404) {
      return {
        success: true,
        notFound: true,
        sha256: cleanHash,
        message: 'File hash not found in VirusTotal database. Upload required for fresh scanning.'
      };
    }

    if (res.status === 429) {
      return {
        success: false,
        notFound: false,
        verdict: 'Verification Unavailable',
        message: 'VirusTotal API rate limit reached (public quota is 4 requests per minute). Please wait a moment and try again.',
        stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
        flaggedEngines: [],
        source: 'VirusTotal v3'
      };
    }

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        notFound: false,
        verdict: 'Verification Unavailable',
        message: 'Invalid or unauthorized VirusTotal API key configured on server. Please verify VIRUSTOTAL_API_KEY in .env.',
        stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
        flaggedEngines: [],
        source: 'VirusTotal v3'
      };
    }

    return {
      success: false,
      notFound: false,
      verdict: 'Verification Unavailable',
      message: `VirusTotal returned unexpected status ${res.status}.`,
      stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
      flaggedEngines: [],
      source: 'VirusTotal v3'
    };
  } catch {
    return {
      success: false,
      notFound: false,
      verdict: 'Verification Unavailable',
      message: 'Network connection failure while contacting VirusTotal servers.',
      stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
      flaggedEngines: [],
      source: 'VirusTotal v3'
    };
  }
}

/**
 * Upload an unknown file to VirusTotal API v3 and poll until completed or bounded timeout.
 * - Streams file buffer in-memory directly to VirusTotal.
 * - Never detonates or writes file to permanent storage.
 */
export async function uploadAndScanFileWithVirusTotal(fileBuffer, fileName = 'sample.bin', mimeType = 'application/octet-stream') {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'your_virustotal_api_key_here') {
    return {
      success: false,
      verdict: 'Verification Unavailable',
      riskLevel: 'Unknown',
      message: 'VirusTotal API key is not configured on the server. Please check VIRUSTOTAL_API_KEY in .env.',
      guidance: 'Threat intelligence verification cannot proceed without a valid API key.',
      stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 },
      detections: [],
      flaggedEngines: [],
      source: 'VirusTotal v3'
    };
  }

  if (!fileBuffer || fileBuffer.length === 0) {
    return {
      success: false,
      verdict: 'Verification Unavailable',
      riskLevel: 'Unknown',
      message: 'Empty or invalid file payload provided for scanning.',
      guidance: 'Please select a valid non-empty file.',
      stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 },
      detections: [],
      flaggedEngines: [],
      source: 'VirusTotal v3'
    };
  }

  if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      verdict: 'Verification Unavailable',
      riskLevel: 'Unknown',
      message: `File size exceeds the 100 MB upload limit (${(fileBuffer.length / (1024 * 1024)).toFixed(1)} MB).`,
      guidance: 'Select a file smaller than 100 MB.',
      stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 },
      detections: [],
      flaggedEngines: [],
      source: 'VirusTotal v3'
    };
  }

  // Calculate local hashes for immediate, authentic forensic metadata
  const localSha256 = createHash('sha256').update(fileBuffer).digest('hex');
  const localSha1 = createHash('sha1').update(fileBuffer).digest('hex');
  const localMd5 = createHash('md5').update(fileBuffer).digest('hex');

  // Instant Intelligence: if this file has already been analyzed by VirusTotal, return the full multi-engine verdict immediately
  try {
    const existingReport = await scanFileHashWithVirusTotal(localSha256, fileName);
    if (existingReport && existingReport.success && !existingReport.notFound && existingReport.totalEngines > 0) {
      return {
        ...existingReport,
        file: {
          name: fileName || existingReport.file?.name || 'sample',
          size: fileBuffer.length,
          mimeType: mimeType || existingReport.file?.mimeType || 'application/octet-stream',
          sha256: localSha256,
          sha1: localSha1,
          md5: localMd5
        },
        fileMeta: {
          ...(existingReport.fileMeta || {}),
          name: fileName || existingReport.fileMeta?.name || 'sample',
          names: [fileName, ...(existingReport.fileMeta?.names || [])]
        }
      };
    }
  } catch (err) {
    console.warn('Pre-upload hash verification failed, continuing to upload:', err);
  }

  let analysisId = null;

  try {
    const formData = new FormData();
    const safeBlob = new Blob([fileBuffer], { type: mimeType || 'application/octet-stream' });
    formData.append('file', safeBlob, fileName || 'sample');

    // VirusTotal v3 requires a dedicated upload URL for files > 32 MB (up to 650 MB)
    let uploadTargetUrl = `${VT_BASE_URL}/files`;
    if (fileBuffer.length > 32 * 1024 * 1024) {
      try {
        const urlReq = await fetch(`${VT_BASE_URL}/files/upload_url`, {
          method: 'GET',
          headers: {
            'x-apikey': apiKey,
            'Accept': 'application/json'
          }
        });
        if (urlReq.ok) {
          const urlData = await urlReq.json();
          if (urlData?.data) {
            uploadTargetUrl = urlData.data;
          }
        }
      } catch (err) {
        console.warn('Unable to retrieve dedicated VT large file upload URL, using standard endpoint:', err);
      }
    }

    const uploadRes = await fetch(uploadTargetUrl, {
      method: 'POST',
      headers: {
        'x-apikey': apiKey,
        'Accept': 'application/json'
      },
      body: formData
    });

    if (uploadRes.status === 429) {
      return {
        success: false,
        verdict: 'Verification Unavailable',
        riskLevel: 'Unknown',
        message: 'VirusTotal API rate limit reached (public quota is 4 requests per minute). Please wait a moment and try again.',
        guidance: 'Rate limit encountered on public VirusTotal tier. Try again in a minute.',
        stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 },
        detections: [],
        flaggedEngines: [],
        file: { name: fileName, size: fileBuffer.length, mimeType, sha256: localSha256, sha1: localSha1, md5: localMd5 },
        source: 'VirusTotal v3'
      };
    }

    if (uploadRes.status === 401 || uploadRes.status === 403) {
      return {
        success: false,
        verdict: 'Verification Unavailable',
        riskLevel: 'Unknown',
        message: 'Invalid or unauthorized VirusTotal API key configured on server. Please verify VIRUSTOTAL_API_KEY in .env.',
        guidance: 'Authentication failure with threat verification backend.',
        stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 },
        detections: [],
        flaggedEngines: [],
        file: { name: fileName, size: fileBuffer.length, mimeType, sha256: localSha256, sha1: localSha1, md5: localMd5 },
        source: 'VirusTotal v3'
      };
    }

    if (uploadRes.status === 409) {
      // File conflict or analysis already ongoing/exists in VirusTotal: fetch latest report
      const existingReport = await scanFileHashWithVirusTotal(localSha256);
      if (existingReport && existingReport.success && !existingReport.notFound) {
        return {
          ...existingReport,
          file: {
            name: fileName,
            size: fileBuffer.length,
            mimeType,
            sha256: localSha256,
            sha1: localSha1,
            md5: localMd5
          }
        };
      }
    }

    if (!uploadRes.ok) {
      // Check if a report is already available before failing
      const fallbackReport = await scanFileHashWithVirusTotal(localSha256);
      if (fallbackReport && fallbackReport.success && !fallbackReport.notFound) {
        return {
          ...fallbackReport,
          file: {
            name: fileName,
            size: fileBuffer.length,
            mimeType,
            sha256: localSha256,
            sha1: localSha1,
            md5: localMd5
          }
        };
      }

      return {
        success: false,
        verdict: 'Verification Unavailable',
        riskLevel: 'Unknown',
        message: `Failed to upload file to VirusTotal (HTTP ${uploadRes.status}).`,
        guidance: 'Verification request failed at upstream security provider.',
        stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 },
        detections: [],
        flaggedEngines: [],
        file: { name: fileName, size: fileBuffer.length, mimeType, sha256: localSha256, sha1: localSha1, md5: localMd5 },
        source: 'VirusTotal v3'
      };
    }

    const uploadData = await uploadRes.json();
    analysisId = uploadData?.data?.id;
  } catch {
    return {
      success: false,
      verdict: 'Verification Unavailable',
      riskLevel: 'Unknown',
      message: 'Network connection failure while uploading file to VirusTotal.',
      guidance: 'Check internet connectivity and try again.',
      stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 },
      detections: [],
      flaggedEngines: [],
      file: { name: fileName, size: fileBuffer.length, mimeType, sha256: localSha256, sha1: localSha1, md5: localMd5 },
      source: 'VirusTotal v3'
    };
  }

  if (!analysisId) {
    return {
      success: false,
      verdict: 'Verification Unavailable',
      riskLevel: 'Unknown',
      message: 'VirusTotal did not return a valid analysis ID for the uploaded file.',
      guidance: 'No analysis session was created by VirusTotal.',
      stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 },
      detections: [],
      flaggedEngines: [],
      file: { name: fileName, size: fileBuffer.length, mimeType, sha256: localSha256, sha1: localSha1, md5: localMd5 },
      source: 'VirusTotal v3'
    };
  }

  // Bounded polling loop: up to 14 attempts, 2.5 seconds interval (up to 35 seconds)
  for (let attempt = 1; attempt <= 14; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      // Check analysis endpoint
      const pollRes = await fetch(`${VT_BASE_URL}/analyses/${analysisId}`, {
        method: 'GET',
        headers: {
          'x-apikey': apiKey,
          'Accept': 'application/json'
        }
      });

      if (pollRes.status === 200) {
        const pollData = await pollRes.json();
        const attrs = pollData?.data?.attributes;
        if (attrs?.status === 'completed') {
          const statsCount = (attrs.stats?.malicious || 0) + (attrs.stats?.suspicious || 0) + (attrs.stats?.undetected || 0) + (attrs.stats?.harmless || 0);
          const resultsCount = attrs.results ? Object.keys(attrs.results).length : 0;
          if (statsCount > 0 || resultsCount > 0) {
            return normalizeVtFileResults(
              attrs.stats,
              attrs.results,
              attrs.date,
              {
                name: fileName,
                sha256: localSha256,
                sha1: localSha1,
                md5: localMd5,
                size: fileBuffer.length,
                typeDescription: mimeType,
                mimeType,
                names: [fileName]
              }
            );
          }
        }
      } else if (pollRes.status === 429) {
        return {
          success: false,
          verdict: 'Verification Unavailable',
          riskLevel: 'Unknown',
          message: 'VirusTotal rate limit encountered while polling analysis.',
          guidance: 'Rate limit encountered on public VirusTotal tier.',
          stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 },
          detections: [],
          flaggedEngines: [],
          file: { name: fileName, size: fileBuffer.length, mimeType, sha256: localSha256, sha1: localSha1, md5: localMd5 },
          source: 'VirusTotal v3'
        };
      }

      // Check file endpoint as well if analysis status is still in-progress
      if (attempt >= 2) {
        const fileRes = await fetch(`${VT_BASE_URL}/files/${localSha256}`, {
          method: 'GET',
          headers: {
            'x-apikey': apiKey,
            'Accept': 'application/json'
          }
        });
        if (fileRes.status === 200) {
          const fileData = await fileRes.json();
          const fileAttrs = fileData?.data?.attributes;
          const statsObj = fileAttrs?.last_analysis_stats || {};
          const sumEngines = (statsObj.malicious || 0) + (statsObj.suspicious || 0) + (statsObj.undetected || 0) + (statsObj.harmless || 0);
          if (sumEngines > 0) {
            return normalizeVtFileResults(
              fileAttrs.last_analysis_stats,
              fileAttrs.last_analysis_results,
              fileAttrs.last_analysis_date,
              {
                name: fileName,
                sha256: fileAttrs.sha256 || localSha256,
                sha1: fileAttrs.sha1 || localSha1,
                md5: fileAttrs.md5 || localMd5,
                size: fileAttrs.size || fileBuffer.length,
                typeDescription: fileAttrs.type_description || mimeType,
                mimeType,
                names: [fileName, ...(fileAttrs.names || [])]
              }
            );
          }
        }
      }
    } catch {
      // Continue next attempt
    }
  }

  // Polling completed without finished analysis -> Inform user clearly of queued analysis
  return {
    success: false,
    verdict: 'Analysis In Progress',
    riskLevel: 'Unknown',
    message: 'VirusTotal is still processing this file analysis in its multi-engine sandbox queue.',
    guidance: 'Initial analysis for newly submitted files takes 30-60 seconds. You can click "Scan Again" in a moment to retrieve the completed verdict.',
    analysisId,
    stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 },
    detections: [],
    flaggedEngines: [],
    file: { name: fileName, size: fileBuffer.length, mimeType, sha256: localSha256, sha1: localSha1, md5: localMd5 },
    fileMeta: { name: fileName, sha256: localSha256, sha1: localSha1, md5: localMd5, size: fileBuffer.length, names: [fileName] },
    source: 'VirusTotal v3'
  };
}

/**
 * HTTP Middleware handler for POST /api/scan-file.
 * Handles both:
 * 1. JSON: { action: "lookup", sha256: "..." }
 * 2. Multipart Form Data: file upload
 */
export async function handleScanFileRequest(req, res) {
  const contentType = req.headers['content-type'] || '';

  // Case 1: JSON payload (e.g. hash lookup)
  if (contentType.includes('application/json')) {
    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk;
    });

    req.on('end', async () => {
      try {
        let sha256 = '';
        let fileName = '';
        if (rawBody) {
          const parsed = JSON.parse(rawBody);
          sha256 = parsed.sha256 || '';
          fileName = parsed.fileName || parsed.name || '';
        }

        const scanResult = await scanFileHashWithVirusTotal(sha256, fileName);

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.statusCode = 200;
        res.end(JSON.stringify(scanResult));
      } catch {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.statusCode = 200;
        res.end(JSON.stringify({
          success: false,
          verdict: 'Verification Unavailable',
          message: 'Invalid request body received by file verification endpoint.',
          stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
          flaggedEngines: [],
          source: 'VirusTotal v3'
        }));
      }
    });
    return;
  }

  // Case 2: Multipart Form Data (file upload)
  if (contentType.includes('multipart/form-data')) {
    try {
      const headers = new Headers();
      for (const [key, val] of Object.entries(req.headers)) {
        if (val) headers.set(key, Array.isArray(val) ? val.join(', ') : val);
      }

      const webReq = new Request('http://localhost' + req.url, {
        method: req.method,
        headers,
        body: req,
        duplex: 'half'
      });

      const formData = await webReq.formData();
      const file = formData.get('file');

      if (!file || typeof file.arrayBuffer !== 'function') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.statusCode = 200;
        res.end(JSON.stringify({
          success: false,
          verdict: 'Verification Unavailable',
          message: 'No file received in multipart request.',
          stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
          flaggedEngines: [],
          source: 'VirusTotal v3'
        }));
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.statusCode = 200;
        res.end(JSON.stringify({
          success: false,
          verdict: 'Verification Unavailable',
          message: `File exceeds maximum upload size of 100 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
          stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
          flaggedEngines: [],
          source: 'VirusTotal v3'
        }));
        return;
      }

      let fileBuffer = Buffer.from(await file.arrayBuffer());
      const scanResult = await uploadAndScanFileWithVirusTotal(fileBuffer, file.name, file.type);
      fileBuffer = null; // Explicitly release memory reference

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.statusCode = 200;
      res.end(JSON.stringify(scanResult));
    } catch {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.statusCode = 200;
      res.end(JSON.stringify({
        success: false,
        verdict: 'Verification Unavailable',
        message: 'Internal server error processing file upload.',
        stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
        flaggedEngines: [],
        source: 'VirusTotal v3'
      }));
    }
    return;
  }

  // Fallback for unsupported content types
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.statusCode = 400;
  res.end(JSON.stringify({
    success: false,
    verdict: 'Verification Unavailable',
    message: 'Unsupported Content-Type. Expected application/json or multipart/form-data.',
    stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 },
    flaggedEngines: [],
    source: 'VirusTotal v3'
  }));
}

