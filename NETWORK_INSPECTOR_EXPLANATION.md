# Browser Network Security Inspector — Architecture & Technical Documentation

## 1. Executive Summary & Purpose

The **Browser Network Security Inspector** is an embedded diagnostic module within **CyberCouncil's Individual Security Console** (`tool-dashboard.html`). It is designed to provide citizens, analysts, and students with an honest, real-time assessment of browser-accessible network parameters without making false or misleading claims about browser capabilities.

### Core Philosophy & Guiding Principles
* **Honest Technical Boundaries**: Standard web browsers run inside a sandboxed execution environment. Web applications cannot execute arbitrary local area network (LAN) port scans, enumerate all connected smart devices, probe router firewalls with raw TCP SYN packets, or inspect operating system DNS configurations. The inspector explicitly educates users on these boundaries rather than fabricating mock scan results.
* **Objective Categorization**: Replaces misleading "100% Safe" claims with an evidence-based three-tier status model:
  * **`✓ Verified`**: The security property or connectivity endpoint was definitively confirmed.
  * **`⚠ Attention`**: An observable risk or suboptimal condition was detected (e.g., unencrypted HTTP, insecure context, offline interface, exposed local IP).
  * **`— Unavailable`**: The browser engine or network policy restricts access to this metric (never fabricated).
* **100% Privacy & Zero Persistence**: Discovered metrics exist strictly in temporary browser memory. Zero network telemetry or WebRTC candidates are transmitted to CyberCouncil backends or stored in `localStorage`, `sessionStorage`, or cookies.
* **Seamless Embedded Integration**: Built directly into the existing Tool Dashboard (`src/pages/ToolDashboard.jsx`) using the established `activeView = 'network'` pattern, preserving the top navbar, left sidebar, and responsive layout.

---

## 2. System Architecture & UI Integration

```
+-------------------------------------------------------------------------------------------------+
|                                    CYBERCOUNCIL TOP NAVBAR                                      |
+------------------------------------+------------------------------------------------------------+
| LEFT SIDEBAR                       | MAIN WORKSPACE AREA                                        |
|                                    |                                                            |
|  * Operations                      |  [When activeView === 'modules']                           |
|    - Security Modules              |    -> Hero Banner & Telemetry Strip (8/8 Active)           |
|                                    |    -> Filter Toolbar & Category Tabs                       |
|  * THREAT INSPECTION               |    -> 8 Security Module Cards                              |
|    - Phishing Scanner              |                                                            |
|    - Password Auditor              |  [When activeView === 'network']                           |
|    - Network Inspector <-----+     |    -> Top Breadcrumb: "<- Back to Security Modules"        |
|    - Social Engineering      |     |    -> Scanner Hero Card & "Run Inspection Again" Button    |
|                              |     |    -> Overall Assessment Banner & Inspection Timestamp     |
|  * Digital Forensics         +---> |    -> 8 Responsive Status Cards Grid                       |
|    - Payload Scanner               |    -> Security Observations (Pass / Warn / Attention)      |
|    - Privacy Auditor               |    -> Actionable Citizen Recommendations                   |
|    - EXIF Extractor                |    -> Collapsible Technical Details & Platform Inventory   |
|    - IP Geolocation                |                                                            |
+------------------------------------+------------------------------------------------------------+
```

### 2.1 View Routing & Navigation Flow
In `src/pages/ToolDashboard.jsx`, the module is integrated via reactive view switching:
```javascript
const [activeView, setActiveView] = useState('modules'); // 'modules' | 'phishing' | 'password' | 'network'
```

* **Launching the Inspector**:
  * Clicking **"Network Inspector"** in the sidebar under `THREAT INSPECTION` sets `setActiveView('network')` with active highlight styling.
  * Clicking **"Launch Module"** on Card #3 ("Network & Interface Auditor" / `wifi-security`) triggers `setActiveView('network')`.
* **Returning to Modules**:
  * Clicking **"Back to Security Modules"** in the top navigation strip or in the sidebar sets `activeView = 'modules'`, cleanly unmounting the inspector and returning to the module grid without reloading the page.
* **Static Fallback**:
  * In static HTML environments (`tool-dashboard.html`), `#networkInspectorContainer` is toggled using `style.display = 'flex'` / `'none'`, with fallback event listeners invoking `runFallbackNetworkInspection()`.

---

## 3. The 8 Core Network Checks & Inspection Pipeline

When the inspector launches (or when **"Run Inspection Again"** is clicked), the engine executes synchronous browser parameter checks alongside asynchronous, non-invasive network queries:

```
                                  [Inspection Trigger]
                                           |
         +---------------------------------+---------------------------------+
         |                                 |                                 |
 [Synchronous Checks]            [Asynchronous Query 1]            [Asynchronous Query 2 & 3]
         |                                 |                                 |
 - window.isSecureContext          Public IP Endpoint               WebRTC ICE Candidate Test
 - window.location.protocol        (api64.ipify.org)                (RTCPeerConnection in memory)
 - navigator.onLine                        |                                 |
 - navigator.connection                    |                        DNS-over-HTTPS Check
                                           |                        (Cloudflare 1.1.1.1 DoH)
                                           v                                 v
                         [Merge Signals & Compute Findings]
                                           |
                    +----------------------+----------------------+
                    |                                             |
            [Render 8 Cards]                              [Generate Guidance]
            - Public IP                                   - Dynamic Findings
            - Connection Info                             - Actionable Recommendations
            - Secure Context                              - Technical Sandbox Drawer
            - Protocol
            - Online Status
            - WebRTC Exposure
            - Capabilities
            - DNS Reachability
```

---

### 3.1 Detailed Check Specifications

#### 1. Public IP Detection
* **Mechanism**: Asynchronous query to `https://api64.ipify.org?format=json` wrapped in an `AbortController` with a strict 3500ms timeout.
* **Output**: Displays the external IP address and classifies it into **IPv4** (dotted-quad) or **IPv6** (colon-separated).
* **Language & Tone**: Labeled as *"Public IP detected"*, avoiding scaremongering phrases like *"Your vulnerable IP"*.
* **Failure Handling**: If the network times out or external connectivity is offline, displays `Verification Unavailable` with the `— Unavailable` badge.
* **Privacy**: Does not pass credentials, query params, or user tracking tokens.

#### 2. Connection Information (Network Information API)
* **Mechanism**: Queries `navigator.connection` (or `navigator.mozConnection` / `navigator.webkitConnection`).
* **Inspected Fields**:
  * `effectiveType`: Connection profile (e.g. `4G`, `3G`, `2G`, `slow-2g`).
  * `downlink`: Estimated bandwidth in megabits per second (e.g. `10 Mbps`).
  * `rtt`: Estimated round-trip time in milliseconds (e.g. `50 ms`).
  * `saveData`: Whether the user enabled Data Saver mode.
  * `type`: Physical interface type (e.g. `wifi`, `cellular`, `ethernet`).
* **Browser Variation Handling**: Supported in Chromium-based browsers (Chrome, Edge, Opera, Brave). If unsupported (e.g., Firefox, Safari), fields display *"Not available in this browser"* with the `— Unavailable` badge. Values are never fabricated.

#### 3. Secure Context Guarantee
* **Mechanism**: Evaluates `window.isSecureContext`.
* **Technical Significance**: Secure Contexts require pages to be delivered over TLS (HTTPS) or local loopback (`localhost`). Browsers restrict high-privilege Web APIs (Web Crypto, Service Workers, WebRTC, Geolocation) to secure contexts.
* **Status**:
  * `true`: Displays `Secure Context` with `✓ Verified` badge.
  * `false`: Displays `Insecure Context` with `⚠ Attention` badge.

#### 4. Transport Protocol
* **Mechanism**: Evaluates `window.location.protocol`.
* **Output**: Displays `HTTPS` (TLS Encrypted) or `HTTP` (Unencrypted).
* **Contextual Nuance**: Explains that this property reflects data in transit between the client browser and the web application server. It does not measure internal Wi-Fi encryption (WPA2/WPA3).

#### 5. Interface Online Status
* **Mechanism**: Evaluates `navigator.onLine`.
* **Output**: Displays `Online` or `Offline`.
* **Educational Note**: The UI explicitly clarifies that `navigator.onLine` only indicates whether the operating system has an active connection to a local network interface; it does not guarantee end-to-end routing to the global Internet.

#### 6. WebRTC Address Exposure Audit
* **Mechanism**: Sandboxed in-memory evaluation using `window.RTCPeerConnection`.
* **Process**:
  1. Instantiates `new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })`.
  2. Creates a local dummy data channel (`pc.createDataChannel('cybercouncil_net_probe')`).
  3. Creates an offer and sets local description to trigger ICE candidate gathering.
  4. Parses `event.candidate.candidate` strings looking for private IPv4 blocks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) or mDNS identifiers (`.local`).
  5. Sets a 1600ms safety timeout.
  6. Immediately closes and terminates the connection (`pc.close()`).
* **Exposure Classifications**:
  * **`No additional address detected`** (`✓ Verified`): Standard behavior where no private address leaks.
  * **`Masked with mDNS`** (`✓ Verified`): Browser replaces local IPs with random UUIDs ending in `.local`.
  * **`Additional address detected`** (`⚠ Attention`): WebRTC candidate exposed a private LAN IP. The UI clarifies that private IPs are standard internal routing constructs, not immediate vulnerabilities.
  * **`Check unavailable`** (`— Unavailable`): WebRTC API is disabled or blocked by an adblocker/privacy extension.

#### 7. Browser Capabilities Inventory
* **Mechanism**: Audits client-side availability of critical network APIs.
* **Inventory Items**:
  * Network Information API (`navigator.connection`)
  * WebRTC PeerConnection (`window.RTCPeerConnection`)
  * Secure Context Guarantee (`window.isSecureContext`)
  * Network Online Status API (`navigator.onLine`)
  * External DNS-over-HTTPS Reachability (DoH)

#### 8. DNS-over-HTTPS (DoH) Resolution Check
* **Mechanism**: Sends an RFC 8484 compliant DNS JSON request to `https://cloudflare-dns.com/dns-query?name=cloudflare.com&type=A`.
* **Measurement**: Records request round-trip latency (`performance.now()`).
* **Boundary Clarification**: Explains that browser security sandboxing strictly prevents web applications from inspecting the user's operating system DNS resolver (`/etc/resolv.conf` or Windows registry). External DoH verifies that encrypted DNS lookups can successfully transit the current network connection.

---

## 4. Evidence-Based Status Classification

| Badge | Meaning | Applied When | Example |
| :--- | :--- | :--- | :--- |
| **`✓ Verified`** | The security property or connectivity endpoint was definitively confirmed. | HTTPS protocol active, Secure Context true, Online true, Public IP retrieved, WebRTC masked or clean. | `Secure Context: window.isSecureContext = true` |
| **`⚠ Attention`** | An observable risk or suboptimal condition was detected. | Insecure HTTP protocol, Insecure Context, Offline state, or WebRTC exposing local IP. | `Protocol: HTTP (Unencrypted)` |
| **`— Unavailable`** | The browser engine or network policy does not expose this information. | Network Information API unsupported (Firefox/Safari), DoH blocked, or Public IP timeout. | `Connection: Not available in this browser` |

> **Important**: The tool intentionally avoids displaying `"Safe"` when an exposure is simply not detected. The UI makes clear: *"Absence of detected exposures indicates normal browser operation, but does not certify complete LAN or router perimeter security."*

---

## 5. Browser Sandboxing & Technical Limitations

A permanent, collapsible **Technical Details & Browser Limitations** section is embedded directly into the inspector. It answers why web applications have strict limitations:

```
+-----------------------------------------------------------------------------------------------+
| Fundamental Browser Security Boundaries                                                       |
| Browser security restrictions prevent CyberCouncil from performing unrestricted               |
| local-network port scans or enumerating every device connected to your network.               |
+-----------------------------------------------------------------------------------------------+
```

### Why Can't a Browser Perform Full LAN Port Scans?
1. **Lack of Raw Socket Access**: Standard JavaScript running in a web browser cannot craft raw TCP SYN, ACK, or UDP packets. Browsers only expose high-level protocols (HTTP/HTTPS via `fetch`/XHR, WebSockets, WebRTC).
2. **Same-Origin Policy (SOP) & CORS**: Even if a browser sends an HTTP request to `http://192.168.1.1`, the response is opaque and blocked by CORS unless the router explicitly allows cross-origin reading.
3. **Protection Against Drive-By Attacks**: If websites could perform unrestricted LAN scanning, any malicious webpage could map a user's home network, attack vulnerable IoT devices, exploit unauthenticated printer interfaces, or access local NAS servers. Browser sandboxing is an essential security protection.

---

## 6. Privacy & Security Guarantees

| Requirement | Implementation Detail | Status |
| :--- | :--- | :--- |
| **No Backend Transmission** | Internal network parameters and WebRTC candidates are never sent to CyberCouncil servers. | Verified |
| **No Client Storage** | No IP addresses or network metrics are written to `localStorage`, `sessionStorage`, or cookies. | Verified |
| **No API Keys** | All external lookups (`api64.ipify.org`, `cloudflare-dns.com`) use free, unauthenticated public endpoints. | Verified |
| **Immediate Memory Cleanup** | `RTCPeerConnection` instances are explicitly closed (`pc.close()`) immediately after candidate evaluation. | Verified |
| **No Continuous Monitoring** | Inspection executes once upon launch or when the user manually clicks "Run Inspection Again". | Verified |

---

## 7. Implementation Files Reference

* [`src/components/NetworkInspectorView.jsx`](file:///home/sam/Downloads/CyberCouncil-main/src/components/NetworkInspectorView.jsx): Primary React component implementing the 8 network checks, layout, status badges, and technical drawer.
* [`src/pages/ToolDashboard.jsx`](file:///home/sam/Downloads/CyberCouncil-main/src/pages/ToolDashboard.jsx): Main dashboard workspace managing `activeView === 'network'`, sidebar link, and Card #3 launch handler.
* [`tool-dashboard.html`](file:///home/sam/Downloads/CyberCouncil-main/tool-dashboard.html): Static fallback markup (`#networkInspectorContainer`) and vanilla JS inspection runner (`runFallbackNetworkInspection()`).
* [`src/styles/dashboard.css`](file:///home/sam/Downloads/CyberCouncil-main/src/styles/dashboard.css) & [`css/tool-dashboard.css`](file:///home/sam/Downloads/CyberCouncil-main/css/tool-dashboard.css): Design system styles for status cards, responsive breakpoints, metric typography, spin animations, and dark/light mode themes.
