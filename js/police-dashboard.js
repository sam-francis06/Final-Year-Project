/**
 * CyberCouncil Police Department - Main Dashboard Controller
 * 
 * ARCHITECTURE:
 * - Dynamic data derivation from shared window.POLICE_DEMO_CASES
 * - Interactive Leaflet Crime Hotspot Mapping with multi-factor filtering
 * - Unified CyberCouncil Police console theme and navigation
 */

document.addEventListener('DOMContentLoaded', () => {
    // ========================================================================
    // 1. Theme Management (Matches Case Management & Police Console)
    // ========================================================================
    const themeBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;

    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        html.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        if (theme === 'dark') {
            themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
        } else {
            themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        }
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = html.getAttribute('data-theme') || 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            updateThemeIcon(next);
        });
    }

    initTheme();

    // ========================================================================
    // 2. Mobile Sidebar Navigation Drawer
    // ========================================================================
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const drawerCloseBtn = document.getElementById('drawerCloseBtn');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const consoleSidebar = document.getElementById('consoleSidebar');

    function openMobileDrawer() {
        if (consoleSidebar) consoleSidebar.classList.add('open', 'mobile-open');
        if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
        if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMobileDrawer() {
        if (consoleSidebar) consoleSidebar.classList.remove('open', 'mobile-open');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
        if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileDrawer);
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileDrawer);
    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileDrawer);

    // Live Clock Display
    function updateClockDisplay() {
        const clockEl = document.getElementById('liveClockDisplay');
        if (!clockEl) return;
        const now = new Date();
        const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' };
        clockEl.textContent = `${now.toLocaleDateString('en-GB', options).replace(',', ' |')} IST`;
    }
    updateClockDisplay();
    setInterval(updateClockDisplay, 60000);

    // ========================================================================
    // 3. Shared Dataset Ingestion & Validation
    // ========================================================================
    const rawCases = (typeof window !== 'undefined' && window.POLICE_DEMO_CASES) ? window.POLICE_DEMO_CASES : [];

    // Fictional Regional Coordinates for Tamil Nadu / Puducherry demo jurisdictions
    const LOCATION_COORDINATES = {
        "Chennai": { lat: 13.0827, lng: 80.2707, region: "Chennai Metropolitan" },
        "Puducherry": { lat: 11.9416, lng: 79.8083, region: "Union Territory Region" },
        "Cuddalore": { lat: 11.7480, lng: 79.7714, region: "Coastal District" },
        "Villupuram": { lat: 11.9401, lng: 79.4861, region: "Central Northern District" },
        "Chengalpattu": { lat: 12.6841, lng: 79.9836, region: "South Sub-Metropolitan" },
        "Tiruvannamalai": { lat: 12.2253, lng: 79.0747, region: "Western Range District" }
    };

    // Calculate latest date timestamp in dataset for relative reference
    function getReferenceTimestamp(cases) {
        if (!cases.length) return new Date().getTime();
        return Math.max(...cases.map(c => new Date(c.dateReported.replace(' ', 'T')).getTime()));
    }
    const referenceTimestamp = getReferenceTimestamp(rawCases);

    // ========================================================================
    // 4. Case Overview Statistics (Cards 1 to 5)
    // ========================================================================
    function renderCaseStatistics(cases) {
        const total = cases.length;
        const newReports = cases.filter(c => c.status === 'New').length;
        const underInvestigation = cases.filter(c => c.status === 'Under Investigation').length;
        const pending = cases.filter(c => c.status === 'Pending').length;
        const closed = cases.filter(c => c.status === 'Closed' || c.status === 'Resolved').length;

        const statTotal = document.getElementById('statTotalCases');
        const statNew = document.getElementById('statNewCases');
        const statInv = document.getElementById('statInvestigatingCases');
        const statPen = document.getElementById('statPendingCases');
        const statClo = document.getElementById('statClosedCases');

        if (statTotal) statTotal.textContent = total;
        if (statNew) statNew.textContent = newReports;
        if (statInv) statInv.textContent = underInvestigation;
        if (statPen) statPen.textContent = pending;
        if (statClo) statClo.textContent = closed;
    }

    // ========================================================================
    // 5. Crime Hotspot Mapping Engine (Leaflet + Dynamic Aggregation)
    // ========================================================================
    let hotspotMap = null;
    let mapMarkersLayer = null;
    let selectedLocation = "Chennai";

    function getIntensityLevel(count) {
        if (count >= 4) return { level: 'very-high', label: 'Very High Intensity' };
        if (count === 3) return { level: 'high', label: 'High Intensity' };
        if (count === 2) return { level: 'medium', label: 'Medium Intensity' };
        return { level: 'low', label: 'Low Intensity' };
    }

    function initHotspotMap() {
        const mapContainer = document.getElementById('hotspotMap');
        if (!mapContainer) return;

        // Verify Leaflet availability
        if (typeof L === 'undefined') {
            console.warn('Leaflet map library unavailable. Falling back to regional grid.');
            mapContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary); font-size: 13.5px; padding: 20px; text-align: center;">Geographic map loaded in offline fallback mode. Regional statistics displayed in cards below.</div>';
            return;
        }

        try {
            // Center map on Tamil Nadu / Puducherry region
            hotspotMap = L.map('hotspotMap', {
                center: [12.45, 79.7],
                zoom: 8,
                zoomControl: true,
                scrollWheelZoom: false
            });

            // OpenStreetMap tile layer with attribution
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '&copy; OpenStreetMap contributors | Demo Hotspot Grid'
            }).addTo(hotspotMap);

            mapMarkersLayer = L.layerGroup().addTo(hotspotMap);
        } catch (err) {
            console.error('Error initializing Leaflet map:', err);
        }
    }

    // Filter Cases for Hotspot Analysis
    function getFilteredHotspotCases() {
        const incidentFilter = document.getElementById('filterIncidentType')?.value || 'All';
        const priorityFilter = document.getElementById('filterPriority')?.value || 'All';
        const timeFilter = document.getElementById('filterTimePeriod')?.value || 'All';

        return rawCases.filter(c => {
            // Incident Type Filter
            if (incidentFilter !== 'All' && c.incidentType !== incidentFilter) return false;

            // Priority Filter
            if (priorityFilter !== 'All' && c.priority !== priorityFilter) return false;

            // Time Period Filter
            if (timeFilter !== 'All') {
                const caseTime = new Date(c.dateReported.replace(' ', 'T')).getTime();
                const diffDays = (referenceTimestamp - caseTime) / (1000 * 60 * 60 * 24);

                if (timeFilter === 'Today') {
                    // Same day as reference
                    const refDate = new Date(referenceTimestamp).toISOString().split('T')[0];
                    const cDate = c.dateReported.split(' ')[0];
                    if (refDate !== cDate) return false;
                } else if (timeFilter === 'Last 7 Days') {
                    if (diffDays > 7) return false;
                } else if (timeFilter === 'Last 30 Days') {
                    if (diffDays > 30) return false;
                }
            }

            return true;
        });
    }

    // Aggregate filtered cases by geographic location
    function aggregateHotspots(filteredCases) {
        const aggregated = {};

        // Pre-populate with all known demo locations so they exist with 0 if filtered out
        Object.keys(LOCATION_COORDINATES).forEach(loc => {
            aggregated[loc] = {
                location: loc,
                coords: LOCATION_COORDINATES[loc],
                totalCases: 0,
                highCriticalCount: 0,
                underInvestigationCount: 0,
                categories: new Set(),
                latestDate: null,
                cases: []
            };
        });

        filteredCases.forEach(c => {
            const loc = c.location;
            if (!aggregated[loc]) {
                aggregated[loc] = {
                    location: loc,
                    coords: LOCATION_COORDINATES[loc] || { lat: 12.5, lng: 79.5 },
                    totalCases: 0,
                    highCriticalCount: 0,
                    underInvestigationCount: 0,
                    categories: new Set(),
                    latestDate: null,
                    cases: []
                };
            }

            const spot = aggregated[loc];
            spot.totalCases += 1;
            if (c.priority === 'Critical' || c.priority === 'High') {
                spot.highCriticalCount += 1;
            }
            if (c.status === 'Under Investigation') {
                spot.underInvestigationCount += 1;
            }
            spot.categories.add(c.incidentType);
            spot.cases.push(c);

            // Latest date comparison
            if (!spot.latestDate || new Date(c.dateReported.replace(' ', 'T')) > new Date(spot.latestDate.replace(' ', 'T'))) {
                spot.latestDate = c.dateReported;
            }
        });

        return aggregated;
    }

    // Update Map Markers and Inspector Card
    function updateHotspotMap() {
        const filteredCases = getFilteredHotspotCases();
        const hotspots = aggregateHotspots(filteredCases);

        // Update Filter summary pill
        const summaryPill = document.getElementById('filterSummaryPill');
        const activeZonesCount = Object.values(hotspots).filter(h => h.totalCases > 0).length;
        if (summaryPill) {
            summaryPill.textContent = `Showing ${filteredCases.length} case${filteredCases.length === 1 ? '' : 's'} across ${activeZonesCount} active hotspot zone${activeZonesCount === 1 ? '' : 's'}`;
        }

        // Update Leaflet Markers
        if (hotspotMap && mapMarkersLayer) {
            mapMarkersLayer.clearLayers();

            Object.values(hotspots).forEach(spot => {
                if (spot.totalCases === 0) return; // Hide 0 count markers on map

                const intensity = getIntensityLevel(spot.totalCases);

                const iconHtml = `
                    <div class="marker-pin-wrap" title="${spot.location} — ${spot.totalCases} cases">
                        <div class="marker-bubble ${intensity.level}">
                            <span>${spot.totalCases}</span>
                        </div>
                        <div class="marker-city-tag">${spot.location}</div>
                    </div>
                `;

                const customIcon = L.divIcon({
                    html: iconHtml,
                    className: 'hotspot-custom-marker',
                    iconSize: [44, 52],
                    iconAnchor: [22, 48],
                    popupAnchor: [0, -42]
                });

                const categoriesArray = Array.from(spot.categories);
                const categoriesListHtml = categoriesArray.map(cat => `<li>${cat}</li>`).join('');

                const popupHtml = `
                    <div style="font-family: inherit; font-size: 13px; line-height: 1.4; min-width: 200px;">
                        <div style="font-weight: 700; font-size: 15px; margin-bottom: 4px; color: #1f2328;">${spot.location}</div>
                        <div style="font-size: 11px; font-weight: 700; color: #ea580c; text-transform: uppercase; margin-bottom: 8px;">DEMO DATA — ${intensity.label}</div>
                        <div style="margin-bottom: 4px;"><strong>Total Cases:</strong> ${spot.totalCases}</div>
                        <div style="margin-bottom: 4px;"><strong>High / Critical:</strong> ${spot.highCriticalCount}</div>
                        <div style="margin-bottom: 6px;"><strong>Under Investigation:</strong> ${spot.underInvestigationCount}</div>
                        <div style="font-weight: 600; margin-top: 6px; font-size: 12px;">Incident Categories:</div>
                        <ul style="margin: 4px 0 8px 16px; padding: 0; font-size: 12px; color: #57606a;">
                            ${categoriesListHtml}
                        </ul>
                        <div style="font-size: 11.5px; color: #6e7781; margin-bottom: 8px;">Latest Report: ${formatDateDisplay(spot.latestDate)}</div>
                        <a href="case-management.html" style="display: block; text-align: center; background: #0969da; color: #ffffff; padding: 5px 10px; border-radius: 5px; text-decoration: none; font-size: 12px; font-weight: 600;">Inspect Cases</a>
                    </div>
                `;

                const marker = L.marker([spot.coords.lat, spot.coords.lng], { icon: customIcon })
                    .bindPopup(popupHtml)
                    .addTo(mapMarkersLayer);

                marker.on('click', () => {
                    selectedLocation = spot.location;
                    updateInspectorCard(spot);
                    highlightActiveRegionTile(spot.location);
                });
            });
        }

        // Ensure selectedLocation has an entry
        if (!hotspots[selectedLocation] || hotspots[selectedLocation].totalCases === 0) {
            // Select first active hotspot or fallback to Chennai
            const activeSpot = Object.values(hotspots).find(h => h.totalCases > 0);
            selectedLocation = activeSpot ? activeSpot.location : "Chennai";
        }

        updateInspectorCard(hotspots[selectedLocation]);
        renderRegionalStrip(hotspots);
    }

    // Format Date for Display
    function formatDateDisplay(dateStr) {
        if (!dateStr) return 'No Reports Recorded';
        try {
            const date = new Date(dateStr.replace(' ', 'T'));
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    }

    // Update Inspector Card Details
    function updateInspectorCard(spot) {
        if (!spot) return;

        const titleEl = document.getElementById('inspectorLocationTitle');
        const badgeEl = document.getElementById('inspectorIntensityBadge');
        const totalEl = document.getElementById('inspectorTotalCases');
        const highEl = document.getElementById('inspectorHighPriorityCases');
        const underInvEl = document.getElementById('inspectorUnderInvestigation');
        const zoneStatusEl = document.getElementById('inspectorZoneStatus');
        const tagsEl = document.getElementById('inspectorCategoriesTags');
        const latestDateEl = document.getElementById('inspectorLatestDate');
        const inspectBtn = document.getElementById('btnInspectCases');

        const intensity = getIntensityLevel(spot.totalCases);

        if (titleEl) titleEl.textContent = spot.location;
        if (badgeEl) {
            badgeEl.className = `inspector-intensity-badge ${intensity.level}`;
            badgeEl.textContent = spot.totalCases > 0 ? intensity.label : 'No Active Cases';
        }
        if (totalEl) totalEl.textContent = spot.totalCases;
        if (highEl) highEl.textContent = spot.highCriticalCount;
        if (underInvEl) underInvEl.textContent = spot.underInvestigationCount;

        if (zoneStatusEl) {
            if (spot.totalCases === 0) {
                zoneStatusEl.textContent = 'Clear / Filtered';
                zoneStatusEl.style.color = 'var(--status-green)';
            } else if (spot.highCriticalCount > 0) {
                zoneStatusEl.textContent = 'High Priority';
                zoneStatusEl.style.color = 'var(--status-red)';
            } else {
                zoneStatusEl.textContent = 'Routine Inquiry';
                zoneStatusEl.style.color = 'var(--brand-blue)';
            }
        }

        if (tagsEl) {
            const categories = Array.from(spot.categories);
            if (categories.length === 0) {
                tagsEl.innerHTML = '<span class="category-tag-pill" style="color: var(--text-tertiary);">None matching filters</span>';
            } else {
                tagsEl.innerHTML = categories.map(cat => `<span class="category-tag-pill">${cat}</span>`).join('');
            }
        }

        if (latestDateEl) {
            latestDateEl.textContent = formatDateDisplay(spot.latestDate);
        }

        if (inspectBtn) {
            // Direct link to case management with location search preset
            inspectBtn.href = `case-management.html`;
        }
    }

    // Render 6 Regional Hotspot Tiles Strip
    function renderRegionalStrip(hotspots) {
        const stripContainer = document.getElementById('hotspotRegionsStrip');
        if (!stripContainer) return;

        stripContainer.innerHTML = Object.values(hotspots).map(spot => {
            const intensity = getIntensityLevel(spot.totalCases);
            const isActive = spot.location === selectedLocation;

            return `
                <div class="region-tile-card ${isActive ? 'active' : ''}" data-location="${spot.location}" title="Click to inspect ${spot.location}">
                    <div class="region-tile-header">
                        <span class="region-tile-name">${spot.location}</span>
                        <span class="region-tile-count ${intensity.level}">${spot.totalCases}</span>
                    </div>
                    <div class="region-tile-meta">
                        <span>High: ${spot.highCriticalCount}</span>
                        <span>Inv: ${spot.underInvestigationCount}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Attach Click Listener to Regional Tiles
        stripContainer.querySelectorAll('.region-tile-card').forEach(card => {
            card.addEventListener('click', () => {
                const loc = card.getAttribute('data-location');
                selectedLocation = loc;
                const spot = hotspots[loc];
                updateInspectorCard(spot);
                highlightActiveRegionTile(loc);

                if (hotspotMap && spot && spot.coords) {
                    hotspotMap.flyTo([spot.coords.lat, spot.coords.lng], 9, { duration: 0.8 });
                }
            });
        });
    }

    function highlightActiveRegionTile(loc) {
        document.querySelectorAll('.region-tile-card').forEach(card => {
            if (card.getAttribute('data-location') === loc) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    // Filter Change Event Listeners
    const filterIncident = document.getElementById('filterIncidentType');
    const filterPriority = document.getElementById('filterPriority');
    const filterTime = document.getElementById('filterTimePeriod');
    const resetFiltersBtn = document.getElementById('btnResetFilters');

    if (filterIncident) filterIncident.addEventListener('change', updateHotspotMap);
    if (filterPriority) filterPriority.addEventListener('change', updateHotspotMap);
    if (filterTime) filterTime.addEventListener('change', updateHotspotMap);

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (filterIncident) filterIncident.value = 'All';
            if (filterPriority) filterPriority.value = 'All';
            if (filterTime) filterTime.value = 'All';
            updateHotspotMap();
        });
    }

    // ========================================================================
    // 6. Case Status Overview Visualization
    // ========================================================================
    function renderStatusOverview(cases) {
        const container = document.getElementById('statusOverviewList');
        if (!container) return;

        const total = cases.length || 1;
        const statuses = [
            { label: 'New', colorClass: 'fill-purple' },
            { label: 'Assigned', colorClass: 'fill-cyan' },
            { label: 'Under Investigation', colorClass: 'fill-amber' },
            { label: 'Pending', colorClass: 'fill-gray' },
            { label: 'Resolved', colorClass: 'fill-blue' },
            { label: 'Closed', colorClass: 'fill-green' }
        ];

        container.innerHTML = statuses.map(s => {
            const count = cases.filter(c => c.status === s.label).length;
            const pct = Math.round((count / total) * 100);

            return `
                <div class="dist-bar-item">
                    <div class="dist-bar-info">
                        <span class="dist-bar-label">${s.label}</span>
                        <span class="dist-bar-val">${count} (${pct}%)</span>
                    </div>
                    <div class="dist-bar-track">
                        <div class="dist-bar-fill ${s.colorClass}" style="width: ${pct}%;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ========================================================================
    // 7. Incident Type Distribution Visualization
    // ========================================================================
    function renderIncidentOverview(cases) {
        const container = document.getElementById('incidentOverviewList');
        if (!container) return;

        const total = cases.length || 1;
        const types = [
            { label: 'Phishing / Scam', colorClass: 'fill-blue' },
            { label: 'Online Financial Fraud', colorClass: 'fill-red' },
            { label: 'Account Compromise', colorClass: 'fill-amber' },
            { label: 'Identity Theft', colorClass: 'fill-purple' },
            { label: 'Malware / Suspicious File', colorClass: 'fill-orange' },
            { label: 'Data / Privacy Exposure', colorClass: 'fill-cyan' },
            { label: 'Unauthorized Access', colorClass: 'fill-red' },
            { label: 'Cyberbullying / Harassment', colorClass: 'fill-gray' }
        ];

        container.innerHTML = types.map(t => {
            const count = cases.filter(c => c.incidentType === t.label).length;
            const pct = Math.round((count / total) * 100);

            return `
                <div class="dist-bar-item">
                    <div class="dist-bar-info">
                        <span class="dist-bar-label">${t.label}</span>
                        <span class="dist-bar-val">${count} (${pct}%)</span>
                    </div>
                    <div class="dist-bar-track">
                        <div class="dist-bar-fill ${t.colorClass}" style="width: ${pct}%;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ========================================================================
    // 8. Priority Overview Visualization
    // ========================================================================
    function renderPriorityOverview(cases) {
        const container = document.getElementById('priorityOverviewList');
        if (!container) return;

        const total = cases.length || 1;
        const priorities = [
            { label: 'Critical', colorClass: 'fill-red' },
            { label: 'High', colorClass: 'fill-orange' },
            { label: 'Medium', colorClass: 'fill-amber' },
            { label: 'Low', colorClass: 'fill-green' }
        ];

        container.innerHTML = priorities.map(p => {
            const count = cases.filter(c => c.priority === p.label).length;
            const pct = Math.round((count / total) * 100);

            return `
                <div class="dist-bar-item">
                    <div class="dist-bar-info">
                        <span class="dist-bar-label">${p.label} Priority</span>
                        <span class="dist-bar-val">${count} (${pct}%)</span>
                    </div>
                    <div class="dist-bar-track">
                        <div class="dist-bar-fill ${p.colorClass}" style="width: ${pct}%;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ========================================================================
    // 9. Recent Cases Table (Sorted by Date Reported, ~5 cases)
    // ========================================================================
    function renderRecentCasesTable(cases) {
        const tbody = document.getElementById('recentCasesTableBody');
        if (!tbody) return;

        const sorted = [...cases].sort((a, b) => {
            const timeA = new Date(a.dateReported.replace(' ', 'T')).getTime();
            const timeB = new Date(b.dateReported.replace(' ', 'T')).getTime();
            return timeB - timeA;
        });

        const recent = sorted.slice(0, 5);

        tbody.innerHTML = recent.map(c => {
            const priorityClass = getPriorityBadgeClass(c.priority);
            const statusClass = getStatusBadgeClass(c.status);

            return `
                <tr>
                    <td><span class="case-id-badge">${c.caseId}</span></td>
                    <td style="font-weight: 500;">${c.incidentType}</td>
                    <td style="font-family: ui-monospace, monospace; font-size: 12px; color: var(--text-secondary);">${c.dateReported}</td>
                    <td>${c.location}</td>
                    <td><span class="priority-pill ${priorityClass}" style="font-size: 11px; padding: 2px 7px;">${c.priority}</span></td>
                    <td style="color: var(--text-secondary);">${c.assignedOfficer}</td>
                    <td><span class="case-status-badge ${statusClass}" style="font-size: 11px; padding: 2px 7px;"><span class="status-dot-sm"></span>${c.status}</span></td>
                    <td>
                        <a href="case-management.html#${c.caseId}" class="btn-table-action" title="Open Case Dossier">
                            <span>View Case</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                        </a>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function getPriorityBadgeClass(priority) {
        switch (priority) {
            case 'Critical': return 'critical';
            case 'High': return 'high';
            case 'Medium': return 'medium';
            case 'Low': return 'low';
            default: return 'medium';
        }
    }

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'New': return 'status-new';
            case 'Assigned': return 'status-assigned';
            case 'Under Investigation': return 'status-investigating';
            case 'Pending': return 'status-pending';
            case 'Resolved': return 'status-resolved';
            case 'Closed': return 'status-closed';
            default: return 'status-new';
        }
    }

    // ========================================================================
    // 10. Recent Investigation Activity (Derived from Case Timelines)
    // ========================================================================
    function renderRecentActivity(cases) {
        const feedContainer = document.getElementById('activityFeedList');
        if (!feedContainer) return;

        // Aggregate timeline events from all cases
        const allEvents = [];
        cases.forEach(c => {
            if (Array.isArray(c.timeline)) {
                c.timeline.forEach(event => {
                    allEvents.push({
                        caseId: c.caseId,
                        time: event.time,
                        event: event.event,
                        user: event.user
                    });
                });
            }
        });

        // Sort by time descending
        allEvents.sort((a, b) => {
            const timeA = new Date(a.time.replace(' ', 'T')).getTime();
            const timeB = new Date(b.time.replace(' ', 'T')).getTime();
            return timeB - timeA;
        });

        // Take top 5 recent activities
        const recentActivities = allEvents.slice(0, 5);

        feedContainer.innerHTML = recentActivities.map(item => `
            <div class="activity-feed-item">
                <span class="activity-feed-dot"></span>
                <div class="activity-feed-content">
                    <div class="activity-feed-text">${item.event}</div>
                    <div class="activity-feed-meta">
                        <a href="case-management.html#${item.caseId}" class="activity-case-link">${item.caseId}</a>
                        <span>•</span>
                        <span>${item.time}</span>
                        <span>•</span>
                        <span>${item.user}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ========================================================================
    // 11. Initial Dashboard Run
    // ========================================================================
    renderCaseStatistics(rawCases);
    initHotspotMap();
    updateHotspotMap();
    renderStatusOverview(rawCases);
    renderIncidentOverview(rawCases);
    renderPriorityOverview(rawCases);
    renderRecentCasesTable(rawCases);
    renderRecentActivity(rawCases);
});