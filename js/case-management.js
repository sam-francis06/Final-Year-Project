/**
 * CyberCouncil Police Department - Case Management Module
 * Architecture: Clean Separation of Data Layer (CaseRepository) from UI Presentation.
 * Ready for future backend integration (e.g. GET /api/police/cases).
 */

// ============================================================================
// 1. Shared Case Dataset (Loaded from js/police-demo-data.js)
// ============================================================================
const sampleCases = (typeof window !== 'undefined' && window.POLICE_DEMO_CASES) ? window.POLICE_DEMO_CASES : [];

// ============================================================================
// 2. Data Layer Abstraction (CaseRepository)
// ============================================================================
/**
 * Isolated Case Data Repository.
 * Future integration: replace internal in-memory methods with GET/POST /api/police/cases
 */
const CaseRepository = {
    _cases: JSON.parse(JSON.stringify(sampleCases)),

    // Fetch all cases (simulates GET /api/police/cases)
    async getAllCases() {
        return [...this._cases];
    },

    // Fetch single case by ID
    async getCaseById(caseId) {
        return this._cases.find(c => c.caseId === caseId) || null;
    },

    // Update case status / priority / officer (simulates PATCH /api/police/cases/:id)
    async updateCase(caseId, updates) {
        const caseIndex = this._cases.findIndex(c => c.caseId === caseId);
        if (caseIndex === -1) return null;

        const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
        this._cases[caseIndex] = {
            ...this._cases[caseIndex],
            ...updates,
            lastUpdated: now
        };

        // Add timeline event if status changed
        if (updates.status) {
            this._cases[caseIndex].timeline.push({
                time: now,
                event: `Status updated to ${updates.status.toUpperCase()}`,
                user: "Investigating Officer (Console)"
            });
        }

        if (updates.assignedOfficer && updates.assignedOfficer !== "Unassigned") {
            this._cases[caseIndex].timeline.push({
                time: now,
                event: `Officer assigned: ${updates.assignedOfficer}`,
                user: "Supervising Desk"
            });
        }

        return { ...this._cases[caseIndex] };
    },

    // Add note to case
    async addNote(caseId, officer, noteText) {
        const c = this._cases.find(item => item.caseId === caseId);
        if (!c) return null;

        const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const newNote = {
            date: now,
            officer: officer || "Duty Officer",
            note: noteText.trim()
        };

        c.notes.unshift(newNote);
        c.lastUpdated = now;

        c.timeline.push({
            time: now,
            event: `Investigation note added by ${newNote.officer}`,
            user: newNote.officer
        });

        return { ...c };
    }
};

// ============================================================================
// 3. UI Controller & Presentation
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
    // Current active filter state
    const filterState = {
        searchQuery: '',
        status: '',
        incidentType: '',
        priority: '',
        officer: '',
        date: ''
    };

    // State of currently inspected case
    let currentDossierCaseId = null;

    // DOM Elements
    const statTotalEl = document.getElementById('statTotalCases');
    const statNewEl = document.getElementById('statNewCases');
    const statInvestigatingEl = document.getElementById('statInvestigatingCases');
    const statPendingEl = document.getElementById('statPendingCases');
    const statClosedEl = document.getElementById('statClosedCases');

    const searchInput = document.getElementById('caseSearchInput');
    const clearSearchBtn = document.getElementById('btnClearSearch');
    const statusFilter = document.getElementById('filterStatusSelect');
    const typeFilter = document.getElementById('filterTypeSelect');
    const priorityFilter = document.getElementById('filterPrioritySelect');
    const officerFilter = document.getElementById('filterOfficerSelect');
    const dateFilter = document.getElementById('filterDateInput');
    const resetFiltersBtn = document.getElementById('btnResetFilters');
    const resultsCountEl = document.getElementById('caseResultsCount');

    const caseTableBody = document.getElementById('caseTableBody');
    const emptyStateEl = document.getElementById('caseEmptyState');

    // Dossier Modal Elements
    const caseModalOverlay = document.getElementById('caseModalOverlay');
    const closeCaseModalBtn = document.getElementById('closeCaseModalBtn');
    const dossierCaseId = document.getElementById('dossierCaseId');
    const dossierIncidentTag = document.getElementById('dossierIncidentTag');
    const dossierStatusBadge = document.getElementById('dossierStatusBadge');
    const dossierPriorityPill = document.getElementById('dossierPriorityPill');
    const dossierTitle = document.getElementById('dossierTitle');
    const dossierActionStatus = document.getElementById('dossierActionStatus');
    const dossierActionPriority = document.getElementById('dossierActionPriority');
    const dossierActionOfficer = document.getElementById('dossierActionOfficer');
    const btnExportDossier = document.getElementById('btnExportDossier');

    // Dossier Sections
    const dossierOverviewGrid = document.getElementById('dossierOverviewGrid');
    const dossierComplainantGrid = document.getElementById('dossierComplainantGrid');
    const dossierDescBlock = document.getElementById('dossierDescBlock');
    const dossierEvidenceList = document.getElementById('dossierEvidenceList');
    const dossierTimeline = document.getElementById('dossierTimeline');
    const dossierNotesList = document.getElementById('dossierNotesList');
    const addNoteTextarea = document.getElementById('addNoteTextarea');
    const btnSubmitNote = document.getElementById('btnSubmitNote');

    // Evidence Lightbox
    const evidenceModalOverlay = document.getElementById('evidenceModalOverlay');
    const closeEvidenceModalBtn = document.getElementById('closeEvidenceModalBtn');
    const evidenceModalTitle = document.getElementById('evidenceModalTitle');
    const evidenceModalContent = document.getElementById('evidenceModalContent');

    // Theme Management
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

    // Mobile Sidebar Drawer
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const drawerCloseBtn = document.getElementById('drawerCloseBtn');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const consoleSidebar = document.getElementById('consoleSidebar');

    function openMobileDrawer() {
        if (consoleSidebar) consoleSidebar.classList.add('open', 'mobile-open');
        if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
    }

    function closeMobileDrawer() {
        if (consoleSidebar) consoleSidebar.classList.remove('open', 'mobile-open');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileDrawer);
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileDrawer);
    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileDrawer);

    // ========================================================================
    // 4. Statistics Calculation
    // ========================================================================
    function updateStatistics(allCases) {
        const total = allCases.length;
        const newCases = allCases.filter(c => c.status === 'New' || c.assignedOfficer === 'Unassigned').length;
        const investigating = allCases.filter(c => c.status === 'Under Investigation').length;
        const pending = allCases.filter(c => c.status === 'Pending').length;
        const closed = allCases.filter(c => c.status === 'Closed' || c.status === 'Resolved').length;
        const critical = allCases.filter(c => c.priority === 'Critical').length;
        const high = allCases.filter(c => c.priority === 'High').length;

        if (statTotalEl) statTotalEl.textContent = total;
        if (statNewEl) statNewEl.textContent = newCases;
        if (statInvestigatingEl) statInvestigatingEl.textContent = investigating;
        if (statPendingEl) statPendingEl.textContent = pending;
        if (statClosedEl) statClosedEl.textContent = closed;

        // Sync sidebar badges
        const sbAll = document.getElementById('sbCountAll');
        const sbNew = document.getElementById('sbCountNew');
        const sbInv = document.getElementById('sbCountInvestigating');
        const sbPen = document.getElementById('sbCountPending');
        const sbClo = document.getElementById('sbCountClosed');
        const sbCrit = document.getElementById('sbCountCritical');
        const sbHigh = document.getElementById('sbCountHigh');

        if (sbAll) sbAll.textContent = total;
        if (sbNew) sbNew.textContent = newCases;
        if (sbInv) sbInv.textContent = investigating;
        if (sbPen) sbPen.textContent = pending;
        if (sbClo) sbClo.textContent = closed;
        if (sbCrit) sbCrit.textContent = critical;
        if (sbHigh) sbHigh.textContent = high;
    }

    // ========================================================================
    // 5. Table Rendering & Filtering
    // ========================================================================
    function getStatusBadgeClass(status) {
        switch (status) {
            case 'New': return 'new';
            case 'Assigned': return 'assigned';
            case 'Under Investigation': return 'investigation';
            case 'Pending': return 'pending';
            case 'Resolved': return 'resolved';
            case 'Closed': return 'closed';
            default: return 'pending';
        }
    }

    function getPriorityPillClass(priority) {
        switch (priority?.toLowerCase()) {
            case 'critical': return 'critical';
            case 'high': return 'high';
            case 'medium': return 'medium';
            case 'low': return 'low';
            default: return 'medium';
        }
    }

    function getOfficerInitials(officerName) {
        if (!officerName || officerName === 'Unassigned') return '?';
        const parts = officerName.replace('Insp.', '').replace('Sub-Insp.', '').trim().split(' ');
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return parts[0].substring(0, 2).toUpperCase();
    }

    function renderCasesTable(cases) {
        caseTableBody.innerHTML = '';

        if (cases.length === 0) {
            emptyStateEl.style.display = 'flex';
            resultsCountEl.innerHTML = 'Showing <strong>0</strong> cases';
            return;
        }

        emptyStateEl.style.display = 'none';
        resultsCountEl.innerHTML = `Showing <strong>${cases.length}</strong> of <strong>${sampleCases.length}</strong> cases`;

        cases.forEach(item => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-case-id', item.caseId);

            const isUnassigned = item.assignedOfficer === 'Unassigned';
            const statusClass = getStatusBadgeClass(item.status);
            const priorityClass = getPriorityPillClass(item.priority);
            const initials = getOfficerInitials(item.assignedOfficer);

            tr.innerHTML = `
                <td class="cell-case-id">
                    <span class="case-id-badge">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                        ${item.caseId}
                    </span>
                </td>
                <td class="cell-incident-type">
                    <span class="incident-type-tag">
                        ${item.incidentType}
                    </span>
                </td>
                <td class="cell-complainant">
                    <div class="complainant-cell-wrap">
                        <span>${item.complainant}</span>
                        <span class="complainant-meta-sub">Demo Record</span>
                    </div>
                </td>
                <td class="cell-date">${item.dateReported}</td>
                <td class="cell-location">${item.location}</td>
                <td>
                    <span class="priority-pill ${priorityClass}">${item.priority}</span>
                </td>
                <td>
                    <div class="officer-cell-wrap ${isUnassigned ? 'unassigned' : ''}">
                        <span class="officer-avatar-sm ${isUnassigned ? 'unassigned' : ''}">${initials}</span>
                        <span>${item.assignedOfficer}</span>
                    </div>
                </td>
                <td>
                    <span class="case-status-badge ${statusClass}">
                        <span class="status-dot-sm"></span>
                        ${item.status}
                    </span>
                </td>
                <td>
                    <button type="button" class="btn-view-case" data-case-id="${item.caseId}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        <span>View Case</span>
                    </button>
                </td>
            `;

            // Row click launches view
            tr.addEventListener('click', (e) => {
                openCaseDossier(item.caseId);
            });

            // Prevent double trigger on button
            const btn = tr.querySelector('.btn-view-case');
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openCaseDossier(item.caseId);
                });
            }

            caseTableBody.appendChild(tr);
        });
    }

    async function applyFiltersAndRender() {
        const allCases = await CaseRepository.getAllCases();
        updateStatistics(allCases);

        const filtered = allCases.filter(item => {
            // Search Query
            if (filterState.searchQuery) {
                const q = filterState.searchQuery.toLowerCase();
                const matchId = item.caseId.toLowerCase().includes(q);
                const matchType = item.incidentType.toLowerCase().includes(q);
                const matchComp = item.complainant.toLowerCase().includes(q);
                const matchDesc = item.description.toLowerCase().includes(q);
                const matchLoc = item.location.toLowerCase().includes(q);
                const matchOff = item.assignedOfficer.toLowerCase().includes(q);
                if (!matchId && !matchType && !matchComp && !matchDesc && !matchLoc && !matchOff) {
                    return false;
                }
            }

            // Status Filter
            if (filterState.status && item.status !== filterState.status) {
                return false;
            }

            // Incident Type Filter
            if (filterState.incidentType && item.incidentType !== filterState.incidentType) {
                return false;
            }

            // Priority Filter
            if (filterState.priority && item.priority.toLowerCase() !== filterState.priority.toLowerCase()) {
                return false;
            }

            // Officer Filter
            if (filterState.officer) {
                if (filterState.officer === 'Unassigned' && item.assignedOfficer !== 'Unassigned') {
                    return false;
                } else if (filterState.officer !== 'Unassigned' && !item.assignedOfficer.includes(filterState.officer)) {
                    return false;
                }
            }

            // Date Filter
            if (filterState.date) {
                if (!item.dateReported.startsWith(filterState.date)) {
                    return false;
                }
            }

            return true;
        });

        renderCasesTable(filtered);
    }

    // Filter Listeners
    searchInput.addEventListener('input', (e) => {
        filterState.searchQuery = e.target.value.trim();
        clearSearchBtn.style.display = filterState.searchQuery ? 'grid' : 'none';
        applyFiltersAndRender();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterState.searchQuery = '';
        clearSearchBtn.style.display = 'none';
        applyFiltersAndRender();
    });

    statusFilter.addEventListener('change', (e) => {
        filterState.status = e.target.value;
        applyFiltersAndRender();
    });

    typeFilter.addEventListener('change', (e) => {
        filterState.incidentType = e.target.value;
        applyFiltersAndRender();
    });

    priorityFilter.addEventListener('change', (e) => {
        filterState.priority = e.target.value;
        applyFiltersAndRender();
    });

    officerFilter.addEventListener('change', (e) => {
        filterState.officer = e.target.value;
        applyFiltersAndRender();
    });

    dateFilter.addEventListener('change', (e) => {
        filterState.date = e.target.value;
        applyFiltersAndRender();
    });

    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        statusFilter.value = '';
        typeFilter.value = '';
        priorityFilter.value = '';
        officerFilter.value = '';
        dateFilter.value = '';

        filterState.searchQuery = '';
        filterState.status = '';
        filterState.incidentType = '';
        filterState.priority = '';
        filterState.officer = '';
        filterState.date = '';

        applyFiltersAndRender();
    });

    // Sidebar Triage Filters Interaction
    const sidebarFilterBtns = document.querySelectorAll('[data-sidebar-filter]');
    const sidebarPriorityBtns = document.querySelectorAll('[data-sidebar-priority]');

    sidebarFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterVal = btn.getAttribute('data-sidebar-filter');
            sidebarFilterBtns.forEach(b => b.classList.remove('active'));
            sidebarPriorityBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            statusFilter.value = filterVal === 'all' ? '' : filterVal;
            priorityFilter.value = '';
            filterState.status = filterVal === 'all' ? '' : filterVal;
            filterState.priority = '';
            applyFiltersAndRender();
        });
    });

    sidebarPriorityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const prioVal = btn.getAttribute('data-sidebar-priority');
            sidebarFilterBtns.forEach(b => b.classList.remove('active'));
            sidebarPriorityBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            priorityFilter.value = prioVal;
            statusFilter.value = '';
            filterState.priority = prioVal;
            filterState.status = '';
            applyFiltersAndRender();
        });
    });

    // ========================================================================
    // 6. Case Dossier Detail Drawer Modal
    // ========================================================================
    async function openCaseDossier(caseId) {
        const c = await CaseRepository.getCaseById(caseId);
        if (!c) return;

        currentDossierCaseId = caseId;

        // Populate Header
        dossierCaseId.textContent = c.caseId;
        dossierTitle.textContent = `${c.incidentType} — ${c.complainant}`;
        dossierIncidentTag.textContent = c.incidentType;

        const statusClass = getStatusBadgeClass(c.status);
        dossierStatusBadge.className = `case-status-badge ${statusClass}`;
        dossierStatusBadge.innerHTML = `<span class="status-dot-sm"></span>${c.status}`;

        const priorityClass = getPriorityPillClass(c.priority);
        dossierPriorityPill.className = `priority-pill ${priorityClass}`;
        dossierPriorityPill.textContent = c.priority;

        // Sync Action Selectors
        dossierActionStatus.value = c.status;
        dossierActionPriority.value = c.priority;
        dossierActionOfficer.value = c.assignedOfficer;

        // Render Overview Grid
        dossierOverviewGrid.innerHTML = `
            <div class="dossier-kv-item">
                <span class="dossier-kv-label">Case Identifier</span>
                <span class="dossier-kv-val mono">${c.caseId}</span>
            </div>
            <div class="dossier-kv-item">
                <span class="dossier-kv-label">Primary Incident Type</span>
                <span class="dossier-kv-val">${c.incidentType}</span>
            </div>
            <div class="dossier-kv-item">
                <span class="dossier-kv-label">Current Lifecycle Status</span>
                <span class="dossier-kv-val">${c.status}</span>
            </div>
            <div class="dossier-kv-item">
                <span class="dossier-kv-label">Assigned Investigating Officer</span>
                <span class="dossier-kv-val">${c.assignedOfficer}</span>
            </div>
            <div class="dossier-kv-item">
                <span class="dossier-kv-label">Date Ingested</span>
                <span class="dossier-kv-val mono">${c.dateReported}</span>
            </div>
            <div class="dossier-kv-item">
                <span class="dossier-kv-label">Last Forensic Update</span>
                <span class="dossier-kv-val mono">${c.lastUpdated}</span>
            </div>
            <div class="dossier-kv-item">
                <span class="dossier-kv-label">Investigating Division</span>
                <span class="dossier-kv-val">${c.location}</span>
            </div>
            <div class="dossier-kv-item">
                <span class="dossier-kv-label">Data Integration Status</span>
                <span class="dossier-kv-val" style="color: var(--status-amber);">Demo Environment (Pending Backend)</span>
            </div>
        `;

        // Render Complainant Grid
        dossierComplainantGrid.innerHTML = `
            <div class="dossier-kv-item">
                <span class="dossier-kv-label">Complainant / Entity Name</span>
                <span class="dossier-kv-val">${c.complainant}</span>
            </div>
            <div class="dossier-kv-item">
                <span class="dossier-kv-label">Identity Verification</span>
                <span class="dossier-kv-val" style="color: var(--status-green);">Fictional Demo Identity Verified</span>
            </div>
            <div class="dossier-kv-item" style="grid-column: span 2;">
                <span class="dossier-kv-label">Contact & Intake Telemetry</span>
                <span class="dossier-kv-val">${c.complainantDetails}</span>
            </div>
        `;

        // Render Incident Details
        dossierDescBlock.innerHTML = `<strong>Reported Occurrence:</strong> ${c.incidentDateTime}\n<strong>Reported Location:</strong> ${c.location}\n\n<strong>Incident Narrative:</strong>\n${c.description}`;

        // Render Evidence
        dossierEvidenceList.innerHTML = '';
        if (c.evidence && c.evidence.length > 0) {
            c.evidence.forEach((ev, idx) => {
                const card = document.createElement('div');
                card.className = 'dossier-evidence-card';
                card.innerHTML = `
                    <div class="evidence-left">
                        <div class="evidence-icon-wrap">
                            ${getEvidenceIconSvg(ev.icon)}
                        </div>
                        <div class="evidence-meta">
                            <div class="evidence-title-row">
                                <span class="evidence-title">${ev.title}</span>
                                <span class="evidence-tag-demo">Demo Evidence</span>
                            </div>
                            <span class="evidence-detail">${ev.detail}</span>
                        </div>
                    </div>
                    <button type="button" class="btn-preview-evidence" data-evidence-idx="${idx}">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        <span>Inspect</span>
                    </button>
                `;

                const inspectBtn = card.querySelector('.btn-preview-evidence');
                if (inspectBtn) {
                    inspectBtn.addEventListener('click', () => {
                        openEvidenceLightbox(ev);
                    });
                }

                dossierEvidenceList.appendChild(card);
            });
        } else {
            dossierEvidenceList.innerHTML = '<p style="font-size: 13px; color: var(--text-tertiary);">No evidence submitted with this preliminary report.</p>';
        }

        // Render Timeline
        dossierTimeline.innerHTML = '';
        if (c.timeline && c.timeline.length > 0) {
            c.timeline.forEach(event => {
                const item = document.createElement('div');
                item.className = 'timeline-event-item';
                item.innerHTML = `
                    <div class="timeline-dot"></div>
                    <div class="timeline-event-header">
                        <span class="timeline-time">${event.time}</span>
                        <span class="timeline-actor-pill">${event.user}</span>
                    </div>
                    <span class="timeline-desc">${event.event}</span>
                `;
                dossierTimeline.appendChild(item);
            });
        }

        // Render Notes
        renderDossierNotes(c.notes);

        // Open Modal
        caseModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function renderDossierNotes(notes) {
        dossierNotesList.innerHTML = '';
        if (!notes || notes.length === 0) {
            dossierNotesList.innerHTML = '<p style="font-size: 13px; color: var(--text-tertiary);">No investigation notes recorded yet.</p>';
            return;
        }

        notes.forEach(noteItem => {
            const noteCard = document.createElement('div');
            noteCard.className = 'dossier-note-item';
            noteCard.innerHTML = `
                <div class="note-item-header">
                    <span class="note-officer-tag">${noteItem.officer}</span>
                    <span class="note-timestamp">${noteItem.date}</span>
                </div>
                <p class="note-text-body">${noteItem.note}</p>
            `;
            dossierNotesList.appendChild(noteCard);
        });
    }

    function closeCaseDossier() {
        caseModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        currentDossierCaseId = null;
    }

    if (closeCaseModalBtn) closeCaseModalBtn.addEventListener('click', closeCaseDossier);
    caseModalOverlay.addEventListener('click', (e) => {
        if (e.target === caseModalOverlay) closeCaseDossier();
    });

    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (evidenceModalOverlay.classList.contains('active')) {
                closeEvidenceLightbox();
            } else if (caseModalOverlay.classList.contains('active')) {
                closeCaseDossier();
            }
        }
    });

    // ========================================================================
    // 7. Case Actions (Status, Priority, Officer, Notes, Export)
    // ========================================================================
    dossierActionStatus.addEventListener('change', async (e) => {
        if (!currentDossierCaseId) return;
        const newStatus = e.target.value;
        const updated = await CaseRepository.updateCase(currentDossierCaseId, { status: newStatus });
        if (updated) {
            const statusClass = getStatusBadgeClass(updated.status);
            dossierStatusBadge.className = `case-status-badge ${statusClass}`;
            dossierStatusBadge.innerHTML = `<span class="status-dot-sm"></span>${updated.status}`;
            applyFiltersAndRender();
        }
    });

    dossierActionPriority.addEventListener('change', async (e) => {
        if (!currentDossierCaseId) return;
        const newPriority = e.target.value;
        const updated = await CaseRepository.updateCase(currentDossierCaseId, { priority: newPriority });
        if (updated) {
            const priorityClass = getPriorityPillClass(updated.priority);
            dossierPriorityPill.className = `priority-pill ${priorityClass}`;
            dossierPriorityPill.textContent = updated.priority;
            applyFiltersAndRender();
        }
    });

    dossierActionOfficer.addEventListener('change', async (e) => {
        if (!currentDossierCaseId) return;
        const newOfficer = e.target.value;
        const updated = await CaseRepository.updateCase(currentDossierCaseId, { assignedOfficer: newOfficer });
        if (updated) {
            applyFiltersAndRender();
        }
    });

    btnSubmitNote.addEventListener('click', async () => {
        if (!currentDossierCaseId) return;
        const noteText = addNoteTextarea.value.trim();
        if (!noteText) {
            addNoteTextarea.focus();
            return;
        }

        const officerName = dossierActionOfficer.value || "Duty Officer";
        const updated = await CaseRepository.addNote(currentDossierCaseId, officerName, noteText);
        if (updated) {
            addNoteTextarea.value = '';
            renderDossierNotes(updated.notes);
            applyFiltersAndRender();
        }
    });

    // Export Case Report
    btnExportDossier.addEventListener('click', async () => {
        if (!currentDossierCaseId) return;
        const c = await CaseRepository.getCaseById(currentDossierCaseId);
        if (!c) return;

        const reportContent = `================================================================================
CYBERCOUNCIL POLICE DEPARTMENT — CYBERCRIME CASE REPORT
CONFIDENTIAL FORENSIC DOSSIER [DEMO RECORD]
================================================================================
Case ID:              ${c.caseId}
Incident Type:        ${c.incidentType}
Lifecycle Status:     ${c.status}
Investigation Priority:${c.priority}
Assigned Officer:     ${c.assignedOfficer}
Date Reported:        ${c.dateReported}
Last Forensic Update: ${c.lastUpdated}
Jurisdiction Unit:    ${c.location}
Integration Note:     Demo Case Record — Database Integration Pending

--------------------------------------------------------------------------------
1. COMPLAINANT IDENTIFIERS (DEMO / SIMULATED)
--------------------------------------------------------------------------------
Complainant Entity:   ${c.complainant}
Intake Telemetry:     ${c.complainantDetails}

--------------------------------------------------------------------------------
2. INCIDENT SPECIFICATION
--------------------------------------------------------------------------------
Reported Occurrence:  ${c.incidentDateTime}
Incident Summary:
${c.description}

--------------------------------------------------------------------------------
3. DEMO EVIDENCE INVENTORY (${c.evidence ? c.evidence.length : 0} Items)
--------------------------------------------------------------------------------
${c.evidence ? c.evidence.map((ev, i) => `[Artifact #${i + 1}]
Type:    ${ev.type}
Title:   ${ev.title}
Detail:  ${ev.detail}
Extract:
${ev.rawPreview || 'No raw extract available'}
`).join('\n') : 'No physical or digital evidence attached.'}

--------------------------------------------------------------------------------
4. CHRONOLOGICAL INVESTIGATION TIMELINE
--------------------------------------------------------------------------------
${c.timeline ? c.timeline.map(t => `[${t.time}] (${t.user}): ${t.event}`).join('\n') : 'No timeline events recorded.'}

--------------------------------------------------------------------------------
5. INVESTIGATING OFFICER NOTES
--------------------------------------------------------------------------------
${c.notes ? c.notes.map(n => `[${n.date} - ${n.officer}]
${n.note}`).join('\n\n') : 'No officer notes recorded.'}

================================================================================
STATUTORY DISCLAIMER:
This document is a demonstration forensic dossier produced by the CyberCouncil
Police Case Management Console. All identities, accounts, and identifiers are
completely fictional sample data.
================================================================================`;

        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Case_Report_${c.caseId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // ========================================================================
    // 8. Evidence Lightbox Modal
    // ========================================================================
    function openEvidenceLightbox(evidenceObj) {
        evidenceModalTitle.textContent = `${evidenceObj.type}: ${evidenceObj.title}`;
        evidenceModalContent.textContent = evidenceObj.rawPreview || evidenceObj.detail;
        evidenceModalOverlay.classList.add('active');
    }

    function closeEvidenceLightbox() {
        evidenceModalOverlay.classList.remove('active');
    }

    if (closeEvidenceModalBtn) closeEvidenceModalBtn.addEventListener('click', closeEvidenceLightbox);
    evidenceModalOverlay.addEventListener('click', (e) => {
        if (e.target === evidenceModalOverlay) closeEvidenceLightbox();
    });

    function getEvidenceIconSvg(iconType) {
        switch (iconType) {
            case 'link':
                return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
            case 'file':
                return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
            case 'mail':
                return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
            case 'image':
                return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
            case 'credit-card':
                return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>';
            default:
                return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
        }
    }

    // ========================================================================
    // 9. Initial Load & Hash Deep-Linking
    // ========================================================================
    await applyFiltersAndRender();

    function checkUrlHashForDossier() {
        const hash = window.location.hash ? window.location.hash.substring(1) : '';
        if (hash && hash.startsWith('CC-')) {
            openCaseDossier(hash);
        }
    }
    checkUrlHashForDossier();
    window.addEventListener('hashchange', checkUrlHashForDossier);
});

