/**
 * CyberCouncil Police Department - Shared Demo Dataset
 * 
 * ARCHITECTURE:
 * Single source of truth for Police Case Management and Police Dashboard.
 * Simulates future backend endpoint: GET /api/police/cases
 * 
 * IMPORTANT:
 * - 100% fictional demonstration data (No real PII, no real citizen addresses)
 * - Generalized demo locations (Chennai, Puducherry, Cuddalore, Villupuram, Chengalpattu, Tiruvannamalai)
 * - Used by:
 *   1. case-management.html
 *   2. police-dashboard.html
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.POLICE_DEMO_CASES = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    const sharedDemoCases = [
        {
            caseId: "CC-2026-0001",
            incidentType: "Online Financial Fraud",
            complainant: "Demo Resident A-102",
            complainantDetails: "Citizen ID: CIT-DEMO-8821 | Contact: citizen.demo.8821@example-gov.org | Channel: Citizen Portal Web",
            dateReported: "2026-09-26 14:20",
            lastUpdated: "2026-09-26 16:30",
            location: "Chennai",
            priority: "High",
            assignedOfficer: "Insp. Vikramaditya",
            status: "Under Investigation",
            description: "Complainant reported an unauthorized debit of ₹48,500 following a fraudulent SMS claiming pending electricity disconnection with an APK download link. Beneficiary account flagged with cyber nodal officer.",
            incidentDateTime: "2026-09-26 13:10 IST",
            evidence: [
                {
                    type: "Suspicious URL",
                    title: "Malicious APK Distribution Host",
                    detail: "hxxps://power-bill-update.example-fake.org/pay.apk",
                    icon: "link",
                    rawPreview: "DNS Resolution: 198.51.100.27\nRegistrar: Demo Privacy Shield Ltd\nPayload Type: Android Banking Trojan (Simulated)\nCertificate: Self-signed untrusted"
                },
                {
                    type: "SMS / Message",
                    title: "Phishing SMS Transcript",
                    detail: "Urgent: Electricity power cut by 9:30 PM tonight due to unpaid bill. Call helpline or update immediately.",
                    icon: "message",
                    rawPreview: "Sender Header: VM-PWRSRV-DEMO\nReceived Timestamp: 2026-09-26 12:45:12 IST\nMessage Body: 'Dear Consumer, Your electricity power will be disconnected tonight at 9:30 PM from power office because your previous month bill was not updated. Please immediately update and contact helpline: hxxps://power-bill-update.example-fake.org/pay.apk'"
                },
                {
                    type: "Transaction Reference",
                    title: "UPI Settlement Identifier",
                    detail: "UPI/DEMO/20260926/9948271630 (Beneficiary VPA: billpay.support@fakebank)",
                    icon: "credit-card",
                    rawPreview: "Transaction Ref: UPI/DEMO/20260926/9948271630\nAmount: INR 48,500.00\nDebited From: ACC-XXXX-XXXX-4912 (Demo Bank)\nCredited To: VPA billpay.support@fakebank\nStatus: Settled to Nodal Aggregator Pool"
                },
                {
                    type: "Screenshot",
                    title: "Fake Payment Gateway Capture",
                    detail: "gateway_screen_capture_sample.png (SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855)",
                    icon: "image",
                    rawPreview: "Image Evidence Metadata:\nFilename: gateway_screen_capture_sample.png\nResolution: 1080x2400 (Mobile Capture)\nSHA-256 Checksum: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\nReported View: Cloned state electricity utility payment portal"
                }
            ],
            timeline: [
                { time: "2026-09-26 14:20", event: "Incident Report Submitted via Citizen Portal", user: "Complainant (Citizen Portal)" },
                { time: "2026-09-26 14:45", event: "Automated Intake & SHA-256 Artifact Checksum Logged", user: "Cyber Intake Daemon" },
                { time: "2026-09-26 15:30", event: "Case CC-2026-0001 assigned to Insp. Vikramaditya", user: "Duty Officer Desk" },
                { time: "2026-09-26 16:15", event: "Notice dispatched to intermediary payment aggregator for freeze request", user: "Insp. Vikramaditya" },
                { time: "2026-09-26 16:30", event: "Status updated for CC-2026-0001 to Under Investigation", user: "Insp. Vikramaditya" }
            ],
            notes: [
                { date: "2026-09-26 16:30", officer: "Insp. Vikramaditya", note: "Domain registrant flagged in WhoisXML records as privacy-masked. Bank liaison officer notified under Section 91 CrPC notice format for swift lien creation." }
            ]
        },
        {
            caseId: "CC-2026-0002",
            incidentType: "Phishing / Scam",
            complainant: "Apex Logistics Tech (Demo Corp)",
            complainantDetails: "Entity: Apex Logistics Tech Rep | Contact: sec-admin@apex-demo-corp.internal | System Ticket: SEC-0491",
            dateReported: "2026-09-27 09:15",
            lastUpdated: "2026-09-27 09:40",
            location: "Chennai",
            priority: "Critical",
            assignedOfficer: "Unassigned",
            status: "New",
            description: "Spear-phishing email campaign targeting accounts payable desk mimicking corporate executive demanding immediate vendor payment invoice alteration and SWIFT routing change.",
            incidentDateTime: "2026-09-27 08:45 IST",
            evidence: [
                {
                    type: "Email / Header",
                    title: "Raw RFC-822 Phishing Email Headers",
                    detail: "Received: from mail-relay.fake-host.net (Spoofed From: ceo@apex-loglstics.com)",
                    icon: "mail",
                    rawPreview: "From: 'CEO Office' <ceo@apex-loglstics.com>\nTo: accounts@apex-demo-corp.internal\nSubject: URGENT: Revised Vendor Sanction Instructions\nSPF: SOFTFAIL\nDKIM: NONE\nDMARC: REJECT\nX-Originating-IP: 203.0.113.88"
                },
                {
                    type: "Suspicious File",
                    title: "Infected PDF Invoice Executable",
                    detail: "Overdue_Invoice_INV99281.pdf.exe (MD5: 5d41402abc4b2a76b9719d911017c592)",
                    icon: "file",
                    rawPreview: "File: Overdue_Invoice_INV99281.pdf.exe\nSize: 412 KB\nEntropy: 7.92 (High Obfuscation)\nStatic Analysis Signature: Generic.Downloader.Heuristic"
                },
                {
                    type: "Suspicious URL",
                    title: "Credential Harvester Landing Page",
                    detail: "hxxps://login.microsoftonline.internal-auth-check.org/auth",
                    icon: "link",
                    rawPreview: "Target: hxxps://login.microsoftonline.internal-auth-check.org/auth\nDomain Created: 2026-09-26 (Fresh 1 day old)\nHosting ASN: AS13335 (Cloudflare)\nPhishing Kit: Corporate SSO Impersonation"
                }
            ],
            timeline: [
                { time: "2026-09-27 09:15", event: "Report Logged via Corporate Incident Form", user: "Corporate Security Lead" },
                { time: "2026-09-27 09:30", event: "Case marked CRITICAL priority due to executive impersonation", user: "Triage System" },
                { time: "2026-09-27 09:40", event: "Evidence added to CC-2026-0002 (Infected PDF Invoice & Email Headers)", user: "Forensic Ingest" }
            ],
            notes: [
                { date: "2026-09-27 09:40", officer: "Triage Desk", note: "Awaiting primary investigator assignment. DNS records indicate domain registered less than 24 hours ago. Corporate email gateway filter rule advised." }
            ]
        },
        {
            caseId: "CC-2026-0003",
            incidentType: "Account Compromise",
            complainant: "Demo Citizen B-204",
            complainantDetails: "Citizen ID: CIT-DEMO-4109 | Contact: cit-b204@example-gov.org | Channel: Citizen Helpdesk",
            dateReported: "2026-09-25 18:05",
            lastUpdated: "2026-09-26 17:00",
            location: "Puducherry",
            priority: "Medium",
            assignedOfficer: "Sub-Insp. Priya Sharma",
            status: "Pending",
            description: "Victim's primary email and cloud storage account hijacked following an automated SIM swap phishing call masquerading as telecom network operator KYC verification.",
            incidentDateTime: "2026-09-25 17:30 IST",
            evidence: [
                {
                    type: "Screenshot",
                    title: "SIM Swap / Security Alert Notice",
                    detail: "Password changed from foreign IP 185.220.101.5 (Tor Exit Node)",
                    icon: "image",
                    rawPreview: "Security Event Audit Log:\nTimestamp: 2026-09-25 17:32:04 UTC\nAction: Primary Password Reset & Recovery Phone Swapped\nRemote IP: 185.220.101.5 (Tor Exit Node Identified)\nUser Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) HeadlessChrome"
                },
                {
                    type: "Suspicious URL",
                    title: "Telegram Account Recovery Bot Link",
                    detail: "hxxps://t.me/telecom_verify_bot_demo",
                    icon: "link",
                    rawPreview: "Telegram Bot Handle: @telecom_verify_bot_demo\nOrigin: Russian Federation Subnet\nTargeted Vector: Telegram Bot phishing relaying OTP codes in real time"
                }
            ],
            timeline: [
                { time: "2026-09-25 18:05", event: "Incident Report Created in Portal", user: "Complainant" },
                { time: "2026-09-25 19:00", event: "Case Assigned to Sub-Insp. Priya Sharma", user: "Inspector Cyber Crime" },
                { time: "2026-09-26 10:15", event: "Investigation note added to CC-2026-0003", user: "Sub-Insp. Priya Sharma" },
                { time: "2026-09-26 17:00", event: "Case CC-2026-0003 moved to Pending awaiting telecom KYC audit", user: "Sub-Insp. Priya Sharma" }
            ],
            notes: [
                { date: "2026-09-26 10:15", officer: "Sub-Insp. Priya Sharma", note: "Victim assisted in securing secondary backup channels and filing emergency recovery claim with cloud provider." },
                { date: "2026-09-26 17:00", officer: "Sub-Insp. Priya Sharma", note: "Formal preservation request submitted under Section 91 CrPC to telecom nodal authority." }
            ]
        },
        {
            caseId: "CC-2026-0004",
            incidentType: "Cyberbullying / Harassment",
            complainant: "Student Welfare Cell (Demo College)",
            complainantDetails: "Liaison Officer: Student Welfare Cell | Code: EDU-REP-77 | Verified Academic Institutional Representative",
            dateReported: "2026-09-24 11:30",
            lastUpdated: "2026-09-25 11:00",
            location: "Chengalpattu",
            priority: "Medium",
            assignedOfficer: "Insp. Rajesh Nair",
            status: "Under Investigation",
            description: "Creation of defamatory impersonation profile on image-sharing platform disseminating manipulated student photographs alongside monetary extortion demands via anonymous crypto wallet.",
            incidentDateTime: "2026-09-23 20:00 IST",
            evidence: [
                {
                    type: "Screenshot",
                    title: "Impersonation Handle Post Archives",
                    detail: "3x archived URL captures with cryptographic SHA-256 hashes",
                    icon: "image",
                    rawPreview: "Forensic URL Preservation Artifact:\nTarget URL: hxxps://instagram-demo.invalid/defamatory_student_voice\nSHA-256 of Captured WebP: 9f83a2164b38d0176efdc12001948ba2\nPreserved via Headless Puppeteer Cluster"
                },
                {
                    type: "Suspicious URL",
                    title: "Defamatory Profile URI",
                    detail: "hxxps://instagram-demo.invalid/defamatory_student_voice",
                    icon: "link",
                    rawPreview: "Platform: Instagram Demo Clone\nProfile Handle: @defamatory_student_voice\nAccount Created: 2026-09-23\nStatus: Under Platform Nodal Review"
                }
            ],
            timeline: [
                { time: "2026-09-24 11:30", event: "Case Registered under IT Act Sec 66C & 66E", user: "Citizen Portal" },
                { time: "2026-09-24 14:00", event: "Case CC-2026-0004 assigned to Investigation Officer Insp. Rajesh Nair", user: "Station House Officer" },
                { time: "2026-09-25 09:30", event: "Formal preservation request submitted to intermediary nodal officer", user: "Insp. Rajesh Nair" }
            ],
            notes: [
                { date: "2026-09-25 11:00", officer: "Insp. Rajesh Nair", note: "Intermediary nodal officer acknowledged Section 79(3)(b) notice. Awaiting IP login logs for registration timestamp." }
            ]
        },
        {
            caseId: "CC-2026-0005",
            incidentType: "Malware / Suspicious File",
            complainant: "City Healthcare Clinic (Demo)",
            complainantDetails: "IT Administrator, City Healthcare Clinic | Contact: it-admin@clinic-demo.internal | Sector: Healthcare",
            dateReported: "2026-09-23 16:45",
            lastUpdated: "2026-09-24 12:30",
            location: "Cuddalore",
            priority: "Critical",
            assignedOfficer: "Insp. Vikramaditya",
            status: "Under Investigation",
            description: "Ransomware payload detected on billing server with `.locked_cc` extension appended to patient appointment records. No patient telemetry exfiltrated according to initial endpoint network inspection.",
            incidentDateTime: "2026-09-23 15:50 IST",
            evidence: [
                {
                    type: "Suspicious File",
                    title: "Ransom Note File",
                    detail: "HOW_TO_RECOVER_FILES.txt (SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069)",
                    icon: "file",
                    rawPreview: "RANSOM NOTE CONTENT (SIMULATED):\nAll your operational records have been encrypted with AES-256.\nTo obtain recovery key, connect to Tor portal:\nhxxp://cyberransomdemokey772.onion/decrypt/caseCC20260005\nDo not rename files."
                },
                {
                    type: "Suspicious URL",
                    title: "Tor Payment Portal Onion URI",
                    detail: "hxxp://cyberransomdemokey772.onion/decrypt/caseCC20260005",
                    icon: "link",
                    rawPreview: "Onion Service: cyberransomdemokey772.onion\nProtocol: Tor v3 Onion Address\nAssociated Ransomware Variant: LockBit-Demo Hybrid"
                },
                {
                    type: "Transaction Reference",
                    title: "Cryptocurrency Ransom Wallet Address",
                    detail: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh (Demo Wallet)",
                    icon: "credit-card",
                    rawPreview: "Cryptocurrency Address: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh\nBlockchain: Bitcoin Network (BTC)\nBalance: 0.00000000 BTC\nTransactions: 0 (Unfunded Demo Address)"
                }
            ],
            timeline: [
                { time: "2026-09-23 16:45", event: "High-Severity Ransomware Alert Ingested", user: "Citizen Portal" },
                { time: "2026-09-23 17:15", event: "Quarantine protocol advised to complainant IT staff", user: "Forensics On-Call" },
                { time: "2026-09-24 10:00", event: "Hard drive image SHA-256 evidence ingested into forensic custody", user: "Insp. Vikramaditya" },
                { time: "2026-09-24 12:30", event: "Investigation note added to CC-2026-0005", user: "Insp. Vikramaditya" }
            ],
            notes: [
                { date: "2026-09-24 12:30", officer: "Insp. Vikramaditya", note: "Offline backups verified intact by clinic IT. Decryption key search underway against NoMoreRansom database. Awaiting malware sandbox memory dump." }
            ]
        },
        {
            caseId: "CC-2026-0006",
            incidentType: "Data / Privacy Exposure",
            complainant: "Demo Citizen D-501",
            complainantDetails: "Citizen ID: CIT-DEMO-6632 | Email: cit-d501@example-gov.org | Channel: Citizen Web Form",
            dateReported: "2026-09-22 10:10",
            lastUpdated: "2026-09-23 09:00",
            location: "Villupuram",
            priority: "Low",
            assignedOfficer: "Sub-Insp. Priya Sharma",
            status: "Resolved",
            description: "Complainant found their resume, employment history, and personal contact details exposed on an unindexed public paste site without authorization.",
            incidentDateTime: "2026-09-22 09:30 IST",
            evidence: [
                {
                    type: "Suspicious URL",
                    title: "Public Paste Snippet Link",
                    detail: "hxxps://paste-dump.demo.invalid/raw/883921",
                    icon: "link",
                    rawPreview: "URI: hxxps://paste-dump.demo.invalid/raw/883921\nExposure Type: Unprotected Text Paste\nStatus: 404 Removed following police takedown notice"
                }
            ],
            timeline: [
                { time: "2026-09-22 10:10", event: "Report Submitted via Portal", user: "Complainant" },
                { time: "2026-09-22 11:30", event: "Takedown request sent to webmaster", user: "Sub-Insp. Priya Sharma" },
                { time: "2026-09-22 15:45", event: "Paste confirmed removed by hosting service", user: "Sub-Insp. Priya Sharma" },
                { time: "2026-09-23 09:00", event: "Case Marked Resolved with citizen consent", user: "Sub-Insp. Priya Sharma" }
            ],
            notes: [
                { date: "2026-09-23 09:00", officer: "Sub-Insp. Priya Sharma", note: "Paste taken down successfully. Search engine de-indexing verification requested and confirmed complete." }
            ]
        },
        {
            caseId: "CC-2026-0007",
            incidentType: "Identity Theft",
            complainant: "Demo Resident E-312",
            complainantDetails: "Citizen ID: CIT-DEMO-1904 | Contact: cit-e312@example-gov.org | Channel: District Helpdesk",
            dateReported: "2026-09-20 15:00",
            lastUpdated: "2026-09-23 10:00",
            location: "Chennai",
            priority: "High",
            assignedOfficer: "Insp. Rajesh Nair",
            status: "Closed",
            description: "Fraudulent instant credit loan of ₹2,50,000 processed in victim's name using forged proof documents submitted on an unverified lending smartphone application.",
            incidentDateTime: "2026-09-20 12:00 IST",
            evidence: [
                {
                    type: "Transaction Reference",
                    title: "Disbursement Sanction Reference",
                    detail: "NBFC-DEMO-LN-88391204 (Disbursement Sanction Letter)",
                    icon: "credit-card",
                    rawPreview: "Loan Account No: NBFC-DEMO-LN-88391204\nAmount: INR 2,50,000.00\nDisbursement Date: 2026-09-20\nDisbursed Account: Unknown Mule Account 99281048201 (Frozen)"
                },
                {
                    type: "Suspicious File",
                    title: "Forged Identity Proof Scan",
                    detail: "forged_id_proof_sample.pdf (Checksum: 8a4c10294e82b7)",
                    icon: "file",
                    rawPreview: "File: forged_id_proof_sample.pdf\nForensic Assessment: Cloned font metrics, mismatched security seals\nDigital Signature: Missing"
                }
            ],
            timeline: [
                { time: "2026-09-20 15:00", event: "Report Registered at Helpdesk", user: "Complainant" },
                { time: "2026-09-21 11:00", event: "Notice issued to NBFC to freeze recovery", user: "Insp. Rajesh Nair" },
                { time: "2026-09-22 17:00", event: "NBFC cancelled fraudulent loan; victim credit restored", user: "NBFC Compliance Officer" },
                { time: "2026-09-23 10:00", event: "Final Case Closure Summary Prepared & Approved", user: "Insp. Rajesh Nair" }
            ],
            notes: [
                { date: "2026-09-23 10:00", officer: "Insp. Rajesh Nair", note: "Full restitution achieved. Beneficiary bank account frozen under separate interstate syndicate inquiry. Case closed with clearance." }
            ]
        },
        {
            caseId: "CC-2026-0008",
            incidentType: "Unauthorized Access",
            complainant: "State Water Utility Substation (Demo)",
            complainantDetails: "SCADA Systems Security Engineer | Contact: telemetry-sec@state-water-demo.gov.in | Critical Infrastructure",
            dateReported: "2026-09-27 12:10",
            lastUpdated: "2026-09-27 12:20",
            location: "Tiruvannamalai",
            priority: "Critical",
            assignedOfficer: "Unassigned",
            status: "New",
            description: "Multiple brute-force SSH and RDP authorization anomalies detected on SCADA telemetry bridge router originating from offshore IP subnet. Ingress access restricted by perimeter firewall.",
            incidentDateTime: "2026-09-27 11:45 IST",
            evidence: [
                {
                    type: "Suspicious File",
                    title: "Perimeter Firewall Auth Stream Log",
                    detail: "auth_failure_stream.log (14,280 failed authentication entries)",
                    icon: "file",
                    rawPreview: "Log Extract (auth_failure_stream.log):\n2026-09-27T11:45:01Z sshd[18492]: Failed password for root from 198.51.100.42 port 49182 ssh2\n2026-09-27T11:45:02Z sshd[18495]: Failed password for admin from 198.51.100.42 port 49184 ssh2\n2026-09-27T11:45:03Z sshd[18498]: Failed password for scada from 198.51.100.42 port 49186 ssh2\nTotal Burst Failures: 14,280 attempts in 3.5 minutes"
                },
                {
                    type: "Suspicious URL",
                    title: "Command & Control Subnet Endpoint",
                    detail: "hxxp://198.51.100.42:8443/sensor/beacon",
                    icon: "link",
                    rawPreview: "Endpoint: hxxp://198.51.100.42:8443/sensor/beacon\nGeoIP: Offshore Anonymous VPS Provider\nReputation: High Threat (Reported in Multiple Botnet Lists)"
                }
            ],
            timeline: [
                { time: "2026-09-27 12:10", event: "Automated SIEM Bridge Incident Ingested", user: "Enterprise Telemetry Ingest" },
                { time: "2026-09-27 12:15", event: "Flagged as CRITICAL: Critical Infrastructure Node", user: "Triage Engine" },
                { time: "2026-09-27 12:20", event: "Perimeter firewall logs attached to case dossier", user: "Triage Desk" }
            ],
            notes: [
                { date: "2026-09-27 12:20", officer: "Triage Desk", note: "Awaiting senior cyber officer assignment. Ingress IP addresses temporarily blacklisted on border gateway. No physical system disruption reported." }
            ]
        },
        {
            caseId: "CC-2026-0009",
            incidentType: "Online Financial Fraud",
            complainant: "Commercial Retailer Hub (Demo)",
            complainantDetails: "Store Manager, Commercial Retailer Hub | Contact: manager@retailer-hub-demo.com | Sector: Retail",
            dateReported: "2026-09-27 15:40",
            lastUpdated: "2026-09-27 16:10",
            location: "Chennai",
            priority: "Critical",
            assignedOfficer: "Insp. Vikramaditya",
            status: "Under Investigation",
            description: "Unauthorized point-of-sale skimming script injected into web store checkout iframe, diverting card tokens to anonymous offshore cloud bucket.",
            incidentDateTime: "2026-09-27 14:30 IST",
            evidence: [
                {
                    type: "Suspicious URL",
                    title: "Injected Script Telemetry Endpoint",
                    detail: "hxxps://analytics-cdn-check.site/collect.js",
                    icon: "link",
                    rawPreview: "Obfuscated Magecart Variant detected\nTelemetry Target: 104.21.48.91 (Proxy Cloud)"
                }
            ],
            timeline: [
                { time: "2026-09-27 15:40", event: "POS Gateway Manipulation Complaint Registered", user: "Store Manager" },
                { time: "2026-09-27 16:10", event: "Assigned to Insp. Vikramaditya for priority tracing", user: "Cyber Crime Unit" }
            ],
            notes: [
                { date: "2026-09-27 16:10", officer: "Insp. Vikramaditya", note: "Web store isolated from gateway. Evidence preservation notice served to cloud hosting provider." }
            ]
        },
        {
            caseId: "CC-2026-0010",
            incidentType: "Phishing / Scam",
            complainant: "Demo Resident P-908",
            complainantDetails: "Citizen ID: CIT-DEMO-9912 | Contact: p908@example-gov.org | Channel: Helpdesk",
            dateReported: "2026-09-26 11:15",
            lastUpdated: "2026-09-26 12:30",
            location: "Puducherry",
            priority: "High",
            assignedOfficer: "Sub-Insp. Priya Sharma",
            status: "Assigned",
            description: "Resident received fraudulent tax refund SMS directing to a spoofed income tax e-filing portal requesting NetBanking credentials.",
            incidentDateTime: "2026-09-26 10:45 IST",
            evidence: [
                {
                    type: "SMS / Message",
                    title: "Spoofed Tax Refund SMS",
                    detail: "Refund of ₹18,400 approved. Update PAN at hxxps://incometax-refund-gov.in",
                    icon: "message",
                    rawPreview: "Header: TD-ITAXIN-FAKE\nPayload: Credential Stealer"
                }
            ],
            timeline: [
                { time: "2026-09-26 11:15", event: "Fake Tax Refund Link Phishing Report Filed", user: "Complainant" },
                { time: "2026-09-26 12:30", event: "Assigned to Sub-Insp. Priya Sharma", user: "Duty Officer Desk" }
            ],
            notes: [
                { date: "2026-09-26 12:30", officer: "Sub-Insp. Priya Sharma", note: "Domain takedown request initiated with NIXI / CERT-In." }
            ]
        },
        {
            caseId: "CC-2026-0011",
            incidentType: "Account Compromise",
            complainant: "District Educational Office (Demo)",
            complainantDetails: "Administrative Superintendent | Contact: admin@dist-edu-demo.gov.in | Public Sector",
            dateReported: "2026-09-25 14:00",
            lastUpdated: "2026-09-25 15:20",
            location: "Cuddalore",
            priority: "Medium",
            assignedOfficer: "Insp. Rajesh Nair",
            status: "Pending",
            description: "Official institutional email account hijacked and used to broadcast fake scholarship disbursement notices containing phishing attachments.",
            incidentDateTime: "2026-09-25 13:15 IST",
            evidence: [
                {
                    type: "Email / Header",
                    title: "Outbound Phishing Spam Batch Headers",
                    detail: "SMTP relay via compromised credentials from VPN IP 194.26.29.112",
                    icon: "mail",
                    rawPreview: "Compromised Mailbox: admin@dist-edu-demo.gov.in\nRecipients: 450 school headmasters"
                }
            ],
            timeline: [
                { time: "2026-09-25 14:00", event: "Administrative Email Account Hijack Reported", user: "System Admin" },
                { time: "2026-09-25 15:20", event: "Preservation order issued to mail service provider", user: "Insp. Rajesh Nair" }
            ],
            notes: [
                { date: "2026-09-25 15:20", officer: "Insp. Rajesh Nair", note: "Account password revoked, 2FA enforced. Mail provider logs requested." }
            ]
        },
        {
            caseId: "CC-2026-0012",
            incidentType: "Phishing / Scam",
            complainant: "Demo Citizen C-118",
            complainantDetails: "Citizen ID: CIT-DEMO-2234 | Contact: c118@example-gov.org | Channel: Mobile App",
            dateReported: "2026-09-21 16:20",
            lastUpdated: "2026-09-23 14:00",
            location: "Chengalpattu",
            priority: "Low",
            assignedOfficer: "Sub-Insp. Priya Sharma",
            status: "Closed",
            description: "Citizen reported receiving WhatsApp messages promising online lottery winnings of ₹25 Lakhs requiring ₹2,000 processing fee. No money was transferred.",
            incidentDateTime: "2026-09-21 15:00 IST",
            evidence: [
                {
                    type: "SMS / Message",
                    title: "WhatsApp Scam Transcript & Number",
                    detail: "Sender: +91-9988776655 (Simulated burner number)",
                    icon: "message",
                    rawPreview: "Message: Congratulations! Your mobile number won KBC Lucky Draw..."
                }
            ],
            timeline: [
                { time: "2026-09-21 16:20", event: "Lottery Scam SMS Report Filed", user: "Complainant" },
                { time: "2026-09-22 11:00", event: "Advisory issued; scam mobile numbers blocked by telecom nodal officer", user: "Sub-Insp. Priya Sharma" },
                { time: "2026-09-23 14:00", event: "Case Closed with prevention advisory confirmed", user: "Sub-Insp. Priya Sharma" }
            ],
            notes: [
                { date: "2026-09-23 14:00", officer: "Sub-Insp. Priya Sharma", note: "Burner mobile disconnected under Chakshu portal reporting guidelines. No financial loss incurred." }
            ]
        }
    ];

    return sharedDemoCases;
}));
