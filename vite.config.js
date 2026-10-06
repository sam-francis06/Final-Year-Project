import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { handleScanUrlRequest, handleScanFileRequest } from './server/virusTotalScanner.js';
import { handleUrlInvestigationRequest, handleUrlScreenshotRequest } from './server/whoisXmlScanner.js';

export default defineConfig(({ mode }) => {
  // Securely load environment variables from .env on server
  const env = loadEnv(mode, process.cwd(), '');
  if (env.VIRUSTOTAL_API_KEY && !process.env.VIRUSTOTAL_API_KEY) {
    process.env.VIRUSTOTAL_API_KEY = env.VIRUSTOTAL_API_KEY;
  }
  if (env.WHOISXML_API_KEY && !process.env.WHOISXML_API_KEY) {
    process.env.WHOISXML_API_KEY = env.WHOISXML_API_KEY;
  }

  const apiMiddlewarePlugin = {
    name: 'cybercouncil-api-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url ? req.url.split('?')[0] : '';
        if (pathname === '/api/scan-url' && req.method === 'POST') {
          return handleScanUrlRequest(req, res);
        }
        if (pathname === '/api/scan-file' && req.method === 'POST') {
          return handleScanFileRequest(req, res);
        }
        if (pathname === '/api/url-investigation' && req.method === 'POST') {
          return handleUrlInvestigationRequest(req, res);
        }
        if (pathname === '/api/url-screenshot' && req.method === 'POST') {
          return handleUrlScreenshotRequest(req, res);
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url ? req.url.split('?')[0] : '';
        if (pathname === '/api/scan-url' && req.method === 'POST') {
          return handleScanUrlRequest(req, res);
        }
        if (pathname === '/api/scan-file' && req.method === 'POST') {
          return handleScanFileRequest(req, res);
        }
        if (pathname === '/api/url-investigation' && req.method === 'POST') {
          return handleUrlInvestigationRequest(req, res);
        }
        if (pathname === '/api/url-screenshot' && req.method === 'POST') {
          return handleUrlScreenshotRequest(req, res);
        }
        next();
      });
    }
  };

  return {
    plugins: [react(), apiMiddlewarePlugin],
    server: {
      port: 5173,
      open: false
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          overview: resolve(__dirname, 'dashboard.html'),
          toolDashboard: resolve(__dirname, 'tool-dashboard.html'),
          incidentLogs: resolve(__dirname, 'incident-logs.html'),
          userCyberLaws: resolve(__dirname, 'user-cyber-laws.html'),
          caseManagement: resolve(__dirname, 'case-management.html'),
          citizenLogin: resolve(__dirname, 'citizen-login.html'),
          policeDashboard: resolve(__dirname, 'police-dashboard.html'),
          policeLogin: resolve(__dirname, 'police-login.html'),
          policeToolDashboard: resolve(__dirname, 'police-tool-dashboard.html'),
          policeCyberLaws: resolve(__dirname, 'police-cyber-laws.html'),
          policeProfile: resolve(__dirname, 'police-profile.html'),
          profile: resolve(__dirname, 'profile.html')
        }
      }
    }
  };
});
