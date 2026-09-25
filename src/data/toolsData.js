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
    name: 'Script & Payload Inspector',
    category: 'heuristics',
    status: 'Operational',
    statusVariant: 'success',
    description: 'Perform static inspection of scripts, HTML, and batch payloads to detect obfuscated eval routines, base64 payloads, and process invocation hooks.',
    capabilities: ['Eval & Exec Detection', 'Base64 Payload Flags', 'Process Spawn Detection'],
    path: '/malware.html',
    icon: 'FileWarning',
    executionType: 'In-Memory Static Parsing'
  },
  {
    id: 'privacy-analyzer',
    name: 'Website Privacy & Telemetry Auditor',
    category: 'web',
    status: 'Operational',
    statusVariant: 'success',
    description: 'Evaluate web properties for tracking pixels, third-party advertising scripts, cookie persistence policies, and transport layer security.',
    capabilities: ['Third-Party Script Audit', 'Cookie Retention Analysis', 'Transport Security'],
    path: '/privacy-analyzer.html',
    icon: 'EyeOff',
    executionType: 'Telemetry Scanner'
  },
  {
    id: 'image-metadata',
    name: 'EXIF & Media Forensics',
    category: 'forensics',
    status: 'Operational',
    statusVariant: 'success',
    description: 'Extract exchangeable image file format (EXIF) metadata including camera sensor details, lens specifications, software timestamps, and embedded GPS tags.',
    capabilities: ['Camera & Lens Tags', 'Embedded GPS Extraction', 'Timestamp Verification'],
    path: '/image-metadata.html',
    icon: 'Camera',
    executionType: 'Binary Header Parser'
  },
  {
    id: 'user-ip-display',
    name: 'Public IP & Geolocation Trace',
    category: 'network',
    status: 'Operational',
    statusVariant: 'success',
    description: 'Identify public routing IP address, verify Autonomous System Number (ASN), determine internet service provider routing, and plot location coordinates.',
    capabilities: ['Public IPv4/IPv6', 'ISP & ASN Query', 'Geographic Coordinates'],
    path: '/user-ip-display.html',
    icon: 'Globe',
    executionType: 'Network API & Map'
  }
];
