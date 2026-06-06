import React from 'react';
import { useApp } from '../../context/AppContext';

const PAGE_TITLES = {
  dashboard: { title: 'Command Center', subtitle: 'Real-Time Crowd Intelligence & Analytics' },
  map: { title: 'Sector Heatmap', subtitle: 'Interactive Zone Density Visualization' },
  prediction: { title: 'Congestion Prediction Engine', subtitle: 'AI-Powered Crowd Forecasting System' },
  routes: { title: 'Route Optimizer', subtitle: 'Safest Path Algorithm for Pilgrims' },
  authority: { title: 'Authority Control Panel', subtitle: 'Administrative Decision Support & Resource Dispatch' },
};

export default function Header({ activePage, sidebarOpen, setSidebarOpen }) {
  const { lastUpdate, isConnected, alerts } = useApp();
  const page = PAGE_TITLES[activePage] || PAGE_TITLES.dashboard;
  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL').length;

  return (
    <header
      className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
      style={{ background: 'var(--bg-dark)', borderColor: 'var(--border)', height: '60px' }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <div className="w-5 flex flex-col gap-1">
            <span className="h-0.5 w-full block" style={{ background: 'currentColor' }} />
            <span className="h-0.5 w-4 block" style={{ background: 'currentColor' }} />
            <span className="h-0.5 w-full block" style={{ background: 'currentColor' }} />
          </div>
        </button>
        <div>
          <h2 className="font-display font-semibold text-sm tracking-wider" style={{ color: 'var(--text-primary)' }}>
            {page.title}
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {page.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {criticalAlerts > 0 && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg critical-pulse"
            style={{ background: 'rgba(213, 0, 249, 0.15)', border: '1px solid rgba(213, 0, 249, 0.4)' }}
          >
            <span style={{ color: '#d500f9', fontSize: '12px' }}>⚠</span>
            <span className="text-xs font-bold" style={{ color: '#d500f9' }}>
              {criticalAlerts} CRITICAL
            </span>
          </div>
        )}

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Last Sync:</span>
          <span className="text-xs font-mono" style={{ color: isConnected ? 'var(--green)' : 'var(--red)' }}>
            {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Connecting...'}
          </span>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #ff6b00, #f0a500)', color: 'white' }}
        >
          A
        </div>
      </div>
    </header>
  );
}