/**
 * CyberCouncil - Tools Registry
 * Structured, professional metadata for all individual security tools.
 */

export const TOOL_CATEGORIES = [
  { id: 'all', label: 'All Modules' },
  { id: 'web', label: 'Web & Phishing' },
  { id: 'auth', label: 'Identity & Access' },
  { id: 'network', label: 'Network & Connectivity' },
  { id: 'heuristics', label: 'Threat Analysis' },
  { id: 'forensics', label: 'Digital Forensics' }
];

export const TOOLS_DATA = [
  {
    id: 'phishing-detection',
    name: 'Phishing & Domain Scanner',
    category: 'web',
    status: 'Operational',
    statusVariant: 'success',
    description: 'Inspect suspicious URLs, spoofed domain names, and email headers for fraudulent indicators and credential-harvesting patterns.',
    capabilities: ['Domain Age & Whois', 'SSL Certificate Verification', 'Redirection Trace'],
    path: '/phishing-detection.html',
    icon: 'ShieldAlert',
    executionType: 'Heuristic & Client Analysis'
  },
  {
    id: 'password-checker',
    name: 'Password Entropy & Leak Auditor',
    category: 'auth',
    status: 'Operational',
    statusVariant: 'success',
    description: 'Audit credential resilience against offline dictionary attacks, sequential character patterns, and entropy calculations with a local password generator.',
    capabilities: ['Entropy Calculation', 'Sequential Dictionary Test', 'Client-Side Generator'],
    path: '/password-checker.html',
    icon: 'KeyRound',
    executionType: 'Client-Side Web Crypto'
  },
  {
    id: 'wifi-security',
    name: 'Network & Interface Auditor',
    category: 'network',
    status: 'Operational',
    statusVariant: 'success',
    description: 'Inspect current client connection properties, test for WebRTC public IP leakage, and evaluate network gateway encryption parameters.',
    capabilities: ['Public IP Exposure', 'WebRTC Leak Test', 'DNS Resolution Check'],
    path: '/wifi-security.html',
    icon: 'Wifi',
    executionType: 'Browser Network Probe'
  },
  {
    id: 'social-engineering',
    name: 'Social Engineering Pattern Detector',
    category: 'heuristics',
    status: 'Operational',
    statusVariant: 'success',
    description: 'Analyze inbound communication text for psychological manipulation tactics including manufactured urgency, authority impersonation, and panic triggers.',
    capabilities: ['Urgency Keyword Analysis', 'Authority Pattern Flags', 'Targeted Highlights'],
    path: '/social-engineering.html',
    icon: 'Brain',
    executionType: 'NLP Rule Engine'
  },
  {
    id: 'malware-scanner',
    name: 'Payload & Malware Scanner',
    category: 'forensics',
    status: 'Operational',
    statusVariant: 'success',
    description: 'Inspect suspicious executables, scripts, documents, and archives using local SHA-256 cryptographic hashing and VirusTotal API v3 multi-engine intelligence.',
    capabilities: ['Client SHA-256 Digest', 'Automatic VirusTotal Upload', 'Multi-Engine Verdict'],
    path: '/tool-dashboard.html#payload-scanner',
    icon: 'FileWarning',
    executionType: 'Automatic VirusTotal v3'
  },
  {
    id: 'privacy-analyzer',
    name: 'Privacy Policy Auditor',
    category: 'web',
    status: 'Operational',
    statusVariant: 'success',
    description: 'Analyze company privacy policies in plain language to reveal data collection, third-party sharing, advertising trackers, retention limits, and user deletion rights.',
    capabilities: ['19-Category Policy Audit', 'Evidence & Excerpt Extraction', 'Transparency & Concern Scoring'],
    path: '/tool-dashboard.html#privacy-auditor',
    icon: 'FileText',
    executionType: 'Citizen Language Analyzer'
  },
  {
    id: 'image-metadata',
    name: 'File Metadata Inspector',
    category: 'forensics',
    status: 'Operational',
    statusVariant: 'success',
    description: 'Inspect embedded metadata across images, documents, audio, and video files. Identify privacy risks and sanitize sensitive EXIF, GPS, and author tags locally.',
    capabilities: ['Multi-Format Metadata Parser', 'GPS & Identity Risk Scoring', 'In-Browser Metadata Sanitizer'],
    path: '/tool-dashboard.html#metadata',
    icon: 'Camera',
    executionType: 'Local Binary Parser'
  }
];
