import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/common/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './components/ThemeSwitcher';
import { getShortcutManager } from './utils/shortcuts';
import { getAnalyticsTracker } from './services/analyticsService';

// Initialize global services
const shortcutManager = getShortcutManager();
const analyticsTracker = getAnalyticsTracker();

// Track app session start
analyticsTracker.trackEvent('app_session_started', {
  userAgent: navigator.userAgent,
  timestamp: new Date().toISOString(),
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
