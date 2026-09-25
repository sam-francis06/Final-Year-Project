/**
 * CyberCouncil - Citizen Tool Dashboard Controller
 * Handles live search, category filtering, theme persistence, and profile display.
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // DOM Elements
    // -------------------------------------------------------------------------
    const htmlEl = document.documentElement;
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const toolSearch = document.getElementById('toolSearch');
    const categoryPills = document.querySelectorAll('.filter-pill');
    const toolCards = document.querySelectorAll('.tool-card');
    const visibleToolsCount = document.getElementById('visibleToolsCount');
    const emptyToolsState = document.getElementById('emptyToolsState');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');

    const heroGreeting = document.getElementById('heroGreeting');
    const navUserName = document.getElementById('navUserName');
    const userInitials = document.getElementById('userInitials');
    const statReportCount = document.getElementById('statReportCount');

    let activeCategory = 'all';
    let searchQuery = '';

    // -------------------------------------------------------------------------
    // Theme Management (Light / Dark)
    // -------------------------------------------------------------------------
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        htmlEl.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        if (theme === 'dark') {
            themeIcon.className = 'ph ph-sun';
            themeToggleBtn.setAttribute('title', 'Switch to Light Theme');
        } else {
            themeIcon.className = 'ph ph-moon';
            themeToggleBtn.setAttribute('title', 'Switch to Dark Theme');
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlEl.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            htmlEl.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    initTheme();

    // -------------------------------------------------------------------------
    // User Profile & Incident Statistics Initialization
    // -------------------------------------------------------------------------
    function initUserData() {
        // Read full name from localStorage
        const storedName = localStorage.getItem('fullname') || localStorage.getItem('email');
        if (storedName && heroGreeting) {
            const cleanName = storedName.includes('@') ? storedName.split('@')[0] : storedName;
            heroGreeting.textContent = `Welcome, ${cleanName}`;
            if (navUserName) navUserName.textContent = cleanName.split(' ')[0];

            if (userInitials) {
                const parts = cleanName.trim().split(' ');
                const initials = parts.length > 1 
                    ? (parts[0][0] + parts[1][0]).toUpperCase()
                    : cleanName.substring(0, 2).toUpperCase();
                userInitials.textContent = initials;
            }
        }

        // Count stored incident reports
        try {
            const reports = JSON.parse(localStorage.getItem('cyberReports') || '[]');
            if (statReportCount) {
                statReportCount.textContent = reports.length;
            }
        } catch (e) {
            console.warn('Error reading reports from localStorage:', e);
        }
    }

    initUserData();

    // -------------------------------------------------------------------------
    // Live Search & Category Filtering Logic
    // -------------------------------------------------------------------------
    function filterTools() {
        let visibleCount = 0;
        const normalizedQuery = searchQuery.trim().toLowerCase();

        toolCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const desc = card.querySelector('.tool-desc')?.textContent.toLowerCase() || '';
            const tags = Array.from(card.querySelectorAll('.feature-tag'))
                .map(t => t.textContent.toLowerCase())
                .join(' ');

            const matchesCategory = activeCategory === 'all' || category === activeCategory;
            const matchesQuery = !normalizedQuery || 
                title.includes(normalizedQuery) || 
                desc.includes(normalizedQuery) || 
                tags.includes(normalizedQuery);

            if (matchesCategory && matchesQuery) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Update count label
        if (visibleToolsCount) {
            visibleToolsCount.textContent = visibleCount;
        }

        // Show/hide empty state
        if (emptyToolsState) {
            emptyToolsState.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    // Category button click handling
    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeCategory = pill.getAttribute('data-category') || 'all';
            filterTools();
        });
    });

    // Search input change handling
    if (toolSearch) {
        toolSearch.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            filterTools();
        });

        // Keyboard shortcut: '/' focuses search input
        window.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== toolSearch && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                toolSearch.focus();
                toolSearch.select();
            }
        });
    }

    // -------------------------------------------------------------------------
    // Mobile Sidebar Drawer
    // -------------------------------------------------------------------------
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }
});
