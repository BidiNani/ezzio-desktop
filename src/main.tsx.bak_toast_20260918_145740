import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/tokens.css';
// ============================================================
// BOOT THÈME + DENSITÉ (avant premier rendu React)
// Évite le flash "dark" quand l'utilisateur a choisi un autre thème.
// ============================================================
(function bootPreferences() {
  try {
    const t = localStorage.getItem('ezzio-theme') || 'dark';
    const d = localStorage.getItem('ezzio-density') || 'normal';
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.setAttribute('data-density', d);
  } catch {
    // localStorage indisponible (mode privé strict) → on laisse les défauts CSS
  }
})();


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);