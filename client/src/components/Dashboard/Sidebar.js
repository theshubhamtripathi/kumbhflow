import React from 'react';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Command Center', icon: '⬡', sub: 'Live Overview' },
  { id: 'map', label: 'Sector Heatmap', icon: '◈', sub: 'Interactive Map' },
  { id: 'prediction', label: 'Congestion AI', icon: '◉', sub: 'Predictive Engine' },
  { id: 'routes', label: 'Route Optimizer', icon: '⟳', sub: 'Safe Pathfinder' },
  { id: 'authority', label: 'Authority Panel', icon: '⬛', sub: 'Control & Dispatch' },
];

export default function Sidebar({ activePage, setActivePage, isOpen }) {
  const { isConnected, liveMetrics, alerts } = useApp();
  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL').length;

  return (
    <aside
      className="flex flex-col transition-all duration-300 relative"
      style={{
        width: isOpen ? '260px' : '0px',
        minWidth: isOpen ? '260px' : '0px',
        background: 'var(--bg-dark)',
        borderRight: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
            style={{ background: 'linear-gradient(135deg, #ff6b00, #f0a500)', boxShadow: '0 0 15px rgba(255,107,0,0.4)' }}
          >
            ॐ
          </div>
          <div>
            <h1 className="font-display font-bold text-sm tracking-widest" style={{ color: 'var(--accent)' }}>
              KUMBHFLOW
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani' }}>
              Crowd Intelligence System
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: isConnected ? 'var(--green)' : '#ff1744',
              boxShadow: isConnected ? '0 0 6px #00e676' : '0 0 6px #ff1744',
              animation: isConnected ? 'pulse 2s infinite' : 'none',
            }}
          />
          <span className="text-xs" style={{ color: isConnected ? 'var(--green)' : '#ff1744', fontFamily: 'Rajdhani' }}>
            {isConnected ? 'LIVE — PRAYAGRAJ OPS' : 'CONNECTING...'}
          </span>
        </div>
      </div>

      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold mb-2 tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          LIVE METRICS
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Pilgrims</p>
            <p className="text-sm font-bold font-mono" style={{ color: 'var(--gold)' }}>
              {(liveMetrics.totalPilgrims / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Safety</p>
            <p
              className="text-sm font-bold font-mono"
              style={{ color: liveMetrics.safetyIndex > 70 ? 'var(--green)' : liveMetrics.safetyIndex > 45 ? 'var(--yellow)' : 'var(--red)' }}
            >
              {liveMetrics.safetyIndex}%
            </p>
          </div>
          <div className="p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Red Zones</p>
            <p className="text-sm font-bold font-mono" style={{ color: 'var(--red)' }}>
              {liveMetrics.criticalZones}
            </p>
          </div>
          <div className="p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Alerts</p>
            <p
              className="text-sm font-bold font-mono"
              style={{ color: criticalAlerts > 0 ? '#d500f9' : 'var(--yellow)' }}
            >
              {liveMetrics.activeAlerts}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <p className="text-xs font-semibold mb-3 px-2 tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          NAVIGATION
        </p>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`nav-item w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-1 text-left ${activePage === item.id ? 'active' : ''}`}
            style={{ color: activePage === item.id ? 'var(--accent)' : 'var(--text-secondary)' }}
          >
            <span className="text-lg w-6 text-center">{item.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold leading-tight" style={{ fontFamily: 'Rajdhani' }}>
                {item.label}
              </p>
              <p className="text-xs opacity-60">{item.sub}</p>
            </div>
            {item.id === 'dashboard' && criticalAlerts > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-bold critical-pulse"
                style={{ background: '#d500f9', color: 'white', fontSize: '10px' }}
              >
                {criticalAlerts}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="text-center">
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Mahakumbh 2025 — Prayagraj
          </p>
          <p className="text-xs font-mono mt-1" style={{ color: 'var(--accent)', opacity: 0.6 }}>
            v2.1.0 — HACKATHON BUILD
          </p>
        </div>
      </div>
    </aside>
  );
}