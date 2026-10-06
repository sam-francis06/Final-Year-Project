// auth-check.js - Add this to all protected pages
document.addEventListener('DOMContentLoaded', function() {
    // Define protected pages that require authentication
    const protectedPages = [
      'police-dashboard',
      'police-tool-dashboard',
      'case-management',
      'cyber-laws.html',
      'police-cyber-laws',
      'police-profile.html',
      'file-hash-generator',
      'file-metadata-analyzer',
      'file-type-validator',
      'metadata',
      'image-metadata-viewer',
      'url-status-checker',
      'username-lookup',
      'police-dashboard.html',
      'police-tool-dashboard.html',
      'case-management.html',
      'cyber-laws.html',
      'police-cyber-laws.html',
      'police-profile.html',
      'file-hash-generator.html',
      'file-metadata-analyzer.html',
      'file-type-validator.html',
      'metadata.html',
      'image-metadata-viewer.html',
      'url-status-checker.html',
      'username-lookup.html'
    ];
    
    // Check if current page is protected
    const currentPage = window.location.pathname.split('/').pop();
    const isProtectedPage = protectedPages.includes(currentPage);
    
    if (isProtectedPage) {
      // Check for police_userid in localStorage
      let policeUserId = localStorage.getItem('police_userid');
      if (!policeUserId) {
        // Automatically provide demo officer access in local development environment
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          policeUserId = 'DEMO-OFFICER';
          localStorage.setItem('police_userid', policeUserId);
        } else {
          // Not logged in, redirect to police login page
          window.location.href = 'police-login.html';
          return;
        }
      }
      // user is authenticated, allow access
    }
  });
