import React from 'react';
import ReactDOM from 'react-dom/client';
import IncidentLogsPage from './pages/IncidentLogsPage';

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <IncidentLogsPage />
    </React.StrictMode>
  );
}
