# Payload & Malware Scanner — Architecture & Workflow Documentation

## 1. Executive Summary & Purpose

The **Payload & Malware Scanner** is an enterprise-grade digital forensics and automatic threat inspection module embedded within **CyberCouncil's Individual Security Console** (`tool-dashboard.html`). It empowers citizens, researchers, security administrators, and digital forensics investigators to automatically verify suspicious files, scripts, email attachments, and software packages for malware **without executing or detonating them locally**.

### Core Architecture Highlights
* **Automatic Single-Action Malware Scanner**: The scanner is an end-to-end malware scanner rather than a passive hash lookup utility. The user selects a file, views forensic identifiers, and triggers a full multi-engine VirusTotal malware scan with a single action: **"Scan for Malware"**.
* **Zero Hash-Lookup Barriers**: The scanner does **not** stop after hashing or require the hash to be pre-indexed by VirusTotal. There is **no** "File Not Found in VirusTotal → Upload?" prompt or separate upload confirmation dialogue.
* **Informational Client-Side SHA-256**: SHA-256 is computed instantly in browser memory via the hardware-accelerated **Web Crypto API** (`crypto.subtle.digest`) for immediate forensic identification and case documentation, without delaying or gating the scan.
* **Direct Server-Side In-Memory Streaming**: The binary file is transmitted via `multipart/form-data` to `/api/scan-file`, forwarded to VirusTotal API v3 in-memory (`POST /files`), and never executed, unpacked, or permanently saved to server disks.
* **Strict Server-Side API Key Secrecy**: The VirusTotal v3 API key (`process.env.VIRUSTOTAL_API_KEY`) is stored strictly in server environment configurations (`.env`). It is never bundled into React, never sent to the browser, and never exposed in network responses or build outputs.
* **Comprehensive Multi-Engine Threat Intelligence**: Polls VirusTotal analysis status until completion and calculates a standardized risk verdict based strictly on actual detection statistics from 70+ industry-standard antivirus engines.

---

## 2. User Experience & Scan Workflow

The scanner follows a seamless, deterministic linear lifecycle:

```
┌────────────────────────────────────────────────────────┐
│               1. SELECT SUSPICIOUS FILE               │
│  (Drag and drop or file picker; up to 100 MB supported) │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│           2. CALCULATE SHA-256 LOCALLY IN RAM          │
│    (Web Crypto API; displays as forensic metadata)     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│            3. USER CLICKS "SCAN FOR MALWARE"           │
│        (Single scan trigger; starts upload flow)       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│            4. AUTOMATICALLY UPLOAD TO BACKEND          │
│  (POST /api/scan-file via multipart/form-data stream)  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│          5. BACKEND FORWARDS TO VIRUSTOTAL v3          │
│       (POST /files with server-side x-apikey)          │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│         6. ASYNCHRONOUS BOUNDED ANALYSIS POLLING       │
│      (GET /analyses/{id} polled every 2s until done)   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│          7. CALCULATE MALWARE RISK & VERDICT           │
│     (Evaluated against actual detection statistics)    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│             8. DISPLAY COMPREHENSIVE REPORT            │
│  (Risk Badge, Detection Stats, Flagged Engines Table,  │
│   Technical Details Accordion, Safety Guidance)        │
└────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Component Architecture

```
+---------------------------------------------------------------------------------------------------+
|                                    CYBERCOUNCIL TOP NAVBAR                                        |
+-------------------------------------+-------------------------------------------------------------+
| LEFT SIDEBAR                        | MAIN WORKSPACE AREA                                         |
|                                     |                                                             |
|  * Operations                       |  [When activeView === 'modules']                            |
|    - Security Modules               |    -> Security Modules Grid (Phishing, Password, Network)   |
|                                     |                                                             |
|  * Threat Inspection                |  [When activeView === 'payload']                            |
|    - Phishing Scanner               |    -> Header: "Payload & Malware Scanner"                   |
|    - Password Auditor               |    -> Submission Privacy Advisory Callout                   |
|    - Network Inspector              |    -> Drag & Drop Upload Zone (Supports up to 100 MB)       |
|    - Social Engineering             |    -> Selected File Card (Filename, Size, MIME type)        |
|                                     |    -> Client-Side SHA-256 Digest Box with "Copy Hash"       |
|  * Digital Forensics                |    -> Primary Action: "Scan for Malware" Button             |
|    - Payload Scanner <-------+      |    -> Live Progress Indicator (Uploading / Analyzing)       |
|    - Privacy Auditor         |      |    -> Verdict Banner & Risk Badge (Low / Medium / High Risk)|
|    - EXIF Extractor          +----> |    -> Detection Stats (Malicious, Suspicious, Harmless)     |
|    - IP Geolocation                 |    -> Flagged Engines Breakdown Table                       |
|                                     |    -> Safety Guidance & IT Act Legal Escalation             |
|  * Legal & Assistance               |    -> Collapsible Technical Details (MD5, SHA-1, Timestamp) |
|    - IT Act Sections                |    -> Action Controls: "Scan Another File" / "Return"       |
|    - Incident Reports               |                                                             |
+-------------------------------------+-------------------------------------------------------------+
                                      |
                                      v
                       +-------------------------------+
                       |      BACKEND API MIDDLEWARE   |
                       |       POST /api/scan-file     |
                       | (server/virusTotalScanner.js) |
                       +---------------+---------------+
                                       |
                                       v
                       +-------------------------------+
                       |       VIRUSTOTAL API v3       |
                       |  - POST /files (Direct Stream)|
                       |  - GET /analyses/{id} (Poll)  |
                       |  - GET /files/{sha256} (Stats)|
                       +-------------------------------+
```

### 3.1 Frontend Scanner States

The reactive UI transitions through well-defined operational states without blocking or confusing intermediate confirmation prompts:

| State | Status Message Displayed | Description |
| :--- | :--- | :--- |
| `idle` | *"Drop your suspicious file here, or click to browse"* | Initial state awaiting file selection. |
| `hashing` | *"Calculating SHA-256 in browser..."* | Local Web Crypto SHA-256 calculation in progress. |
| `ready` | *"File selected. Ready to scan."* | File metadata and client SHA-256 displayed. "Scan for Malware" button is active. |
| `uploading` | *"Uploading file to VirusTotal..."* | Binary payload is being transmitted to `/api/scan-file`. |
| `analyzing` | *"VirusTotal is analyzing the file across security engines..."* | Backend is polling VirusTotal analysis status across 70+ vendors. |
| `complete` | *"Malware analysis completed."* | Analysis finished; risk calculated and full report rendered. |
| `error` | *"Verification Unavailable"* | Network failure, timeout, 429 rate limit, or invalid configuration. |

---

## 4. Backend Processing & VirusTotal Integration

The backend service implemented in `server/virusTotalScanner.js` and wired into `vite.config.js` provides secure, in-memory proxying to VirusTotal v3.

### 4.1 In-Memory File Reception
* The endpoint `/api/scan-file` accepts `multipart/form-data` containing the `file` field.
* Validates payload presence and enforces a strict **100 MB upload limit**.
* Generates local SHA-256, SHA-1, and MD5 hashes using Node's native `node:crypto` library:
  ```javascript
  const localSha256 = createHash('sha256').update(fileBuffer).digest('hex');
  const localSha1 = createHash('sha1').update(fileBuffer).digest('hex');
  const localMd5 = createHash('md5').update(fileBuffer).digest('hex');
  ```
* **Zero Local Execution Guarantee**: Files are held purely as volatile RAM buffers. No files are executed, opened, unzipped, interpreted, or written to physical disks.

### 4.2 Transmission to VirusTotal v3
* The binary buffer is streamed to the VirusTotal files ingestion endpoint:
  ```http
  POST https://www.virustotal.com/api/v3/files
  Headers:
    x-apikey: process.env.VIRUSTOTAL_API_KEY
    Accept: application/json
  Body:
    multipart/form-data (safeBlob, filename)
  ```
* **Conflict & Re-submission Handling (`HTTP 409`)**: If VirusTotal returns `HTTP 409` (`AlreadySubmittedError` / conflict) because the file was recently submitted or is already being analyzed, the backend seamlessly retrieves the active/latest report via `GET /files/{localSha256}` without failing or returning an error to the user.

### 4.3 Bounded Analysis Polling
After obtaining the `analysisId`:
* The backend queries the analysis status endpoint:
  ```http
  GET https://www.virustotal.com/api/v3/analyses/{analysisId}
  Headers:
    x-apikey: process.env.VIRUSTOTAL_API_KEY
  ```
* **Bounded Polling Loop**: Polls every **2,000 ms** up to **8 attempts** (16 seconds maximum).
* When `status === "completed"`, it extracts vendor statistics and detection signatures.
* If bounded polling times out, it checks `GET /files/{localSha256}` as a fallback before returning `Verification Unavailable` (never falsely reporting an unverified file as safe).

---

## 5. Malware Risk Calculation Model

CyberCouncil synthesizes complex vendor telemetry into four transparent, authoritative risk classifications:

| Detection Criteria | Risk Level | Visual Badge | Guidance Provided to Citizen |
| :--- | :--- | :--- | :--- |
| `malicious >= 2` | **High Risk** | `Unsafe / Malicious File` *(Red)* | Multiple security engines identified this file as malicious. Do not open or execute the file. Remove or quarantine it using trusted security software. |
| `malicious === 1` OR `suspicious >= 1` | **Medium Risk** | `Suspicious File` *(Amber)* | One or more security engines identified suspicious or potentially malicious characteristics. Avoid opening or executing this file until it has been independently verified. |
| `malicious === 0` AND `suspicious === 0` | **Low Risk** | `No Threat Detected` *(Green)* | No malicious signatures were flagged by security engines.<br><br>**Mandatory Safety Disclaimer:** *"Zero detections do not guarantee that a file is completely safe."* |
| Network error, timeout, rate limit (`HTTP 429`), or auth failure | **Unknown** | `Verification Unavailable` *(Gray)* | Threat intelligence verification could not be completed at this time. User is guided to verify server configuration or retry later. |

---

## 6. Information Architecture & Presentation

When a file scan completes, the user is presented with a rich, structured forensics dashboard:

### 6.1 Verdict & Risk Header
* **Status Badge**: Visual color-coded pill displaying the risk level (`HIGH RISK`, `MEDIUM RISK`, `LOW RISK`, `RISK UNKNOWN`).
* **Verdict Heading**: Human-readable verdict statement (e.g., *"VirusTotal detected this file as malicious by 66 security engines."*).
* **Mandatory Safety Disclaimer**: Displayed prominently for zero-detection files to guard against zero-day and targeted threats.

### 6.2 Detection Statistics Strip
Displays four distinct metric cards:
* **Malicious**: Number of engines classifying the binary as active malware.
* **Suspicious**: Engines flagging heuristic anomalies or questionable signatures.
* **Harmless**: Engines explicitly verifying the binary as known good.
* **Undetected**: Engines reporting no threat signatures found.

### 6.3 Security Engine Detections Table
When any engines flag the sample, a table displays the specific details:
* **Engine Name**: Antivirus vendor (e.g., Microsoft, Kaspersky, CrowdStrike, Sophos, ClamAV).
* **Category**: Classification category (`malicious` or `suspicious`).
* **Detection Signature**: Specific threat signature (e.g., `Virus:DOS/EICAR_Test_File`, `Trojan.Generic`).

### 6.4 Safety Guidance & Incident Actions
Provides actionable recommendations tailored to the computed risk level, with one-click action buttons:
* **Copy Forensic Report**: Copies a formatted incident summary to the clipboard for IT or police reports.
* **File Incident Report**: Direct navigation to CyberCouncil's statutory reporting page (`reports.html`).
* **Scan Another File**: Resets the state and returns immediately to the dropzone.

### 6.5 Collapsible Technical Details Accordion
Contains a comprehensive forensic specification table:
* **Filename**: Original submitted file name.
* **File Size**: Byte-accurate formatted size.
* **MIME Type**: Detected media/content type.
* **SHA-256**: 64-character cryptographic hash digest.
* **SHA-1**: 40-character legacy forensic hash.
* **MD5**: 32-character legacy checksum.
* **VirusTotal Analysis Status**: `completed` verification flag.
* **Analysis Timestamp**: Localized and ISO UTC timestamp for chain of custody.

---

## 7. Privacy Advisory & Security Safeguards

### 7.1 Submission Privacy Advisory
Because files submitted to VirusTotal are analyzed by third-party security vendors according to VirusTotal's terms of service, the UI features a prominent warning:
> **Submission Privacy Advisory:** Do not upload confidential, private, financial, corporate, or personally sensitive files. Files submitted to VirusTotal may be processed according to VirusTotal's public service terms.

### 7.2 Zero Local Execution Policy
CyberCouncil never detonates or executes uploaded files:
* Files are never executed in the browser sandbox.
* The backend does not run scripts, launch executables, unpack archives, or execute document macros.
* Samples are processed purely as binary streams forwarded to external threat intelligence engines.

### 7.3 API Credential Protection
* The VirusTotal API key is stored exclusively on the server in `.env`.
* Front-end bundles in `dist/` contain **zero** instances of `VIRUSTOTAL_API_KEY`.
* Browser network traffic is limited strictly to `POST /api/scan-file`.

---

## 8. Supported File Types

The scanner accepts a broad range of executable and document formats up to **100 MB**:
* **Binaries & Installers**: `.exe`, `.dll`, `.msi`, `.apk`, `.jar`, `.scr`
* **Scripts & Payloads**: `.bat`, `.cmd`, `.ps1`, `.js`
* **Documents & Macros**: `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`
* **Archives**: `.zip`, `.rar`

---

## 9. Statutory Legal Alignment (Indian IT Act, 2000)

When malicious payloads are confirmed, CyberCouncil provides direct legal context for cybercrime escalation:
* **Section 43 (IT Act, 2000)**: Imposes civil liability and compensation for introducing computer contaminants or viruses.
* **Section 66 (IT Act, 2000)**: Imposes penal punishment (up to 3 years imprisonment or fine up to ₹5 lakh) for computer-related offences involving fraudulent malware dissemination.
* **National Cyber Crime Reporting Portal**: Direct guidance to report incidents to `cybercrime.gov.in` or call the national helpline **1930**.
