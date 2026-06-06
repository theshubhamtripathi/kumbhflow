import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

function getStatusColor(status, density) {
  const colors = {
    CRITICAL: { bg: 'rgba(213,0,249,0.35)', border: '#d500f9', text: '#d500f9', glow: '0 0 20px rgba(213,0,249,0.6)' },
    RED: { bg: 'rgba(255,23,68,0.25)', border: '#ff1744', text: '#ff1744', glow: '0 0 16px rgba(255,23,68,0.5)' },
    YELLOW: { bg: 'rgba(255,235,59,0.15)', border: '#ffeb3b', text: '#ffeb3b', glow: '0 0 12px rgba(255,235,59,0.3)' },
    GREEN: { bg: 'rgba(0,230,118,0.1)', border: '#00e676', text: '#00e676', glow: 'none' },
    CLOSED: { bg: 'rgba(84,110,122,0.15)', border: '#546e7a', text: '#546e7a', glow: 'none' },
  };
  return colors[status] || colors.GREEN;
}

const ZONE_ICONS = {
  SANGAM: '🌊',
  GHAT: '⛵',
  TRANSIT: '🚂',
  TEMPLE: '⛩️',
  CAMP: '⛺',
  COMMERCIAL: '🏪',
};

function SectorCell({ sector, onClick, isSelected }) {
  const colors = getStatusColor(sector.status, sector.density);

  return (
    <div
      className="sector-cell relative p-3 rounded-xl cursor-pointer flex flex-col gap-1.5"
      onClick={() => onClick(sector)}
      style={{
        background: colors.bg,
        border: `1.5px solid ${isSelected ? 'var(--gold)' : colors.border}`,
        boxShadow: isSelected ? `0 0 0 2px var(--gold), ${colors.glow}` : colors.glow,
        minHeight: '110px',
        animation: (sector.status === 'CRITICAL' || sector.status === 'RED') ? 'none' : 'none',
      }}
    >
      {sector.status === 'CRITICAL' && (
        <div
          className="absolute inset-0 rounded-xl critical-pulse"
          style={{ background: 'rgba(213,0,249,0.06)', pointerEvents: 'none' }}
        />
      )}

      <div className="flex items-start justify-between">
        <span className="text-xs font-mono font-bold" style={{ color: colors.text }}>
          {sector.sectorId}
        </span>
        <span className="text-base leading-none">{ZONE_ICONS[sector.zone] || '📍'}</span>
      </div>

      <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)', fontSize: '11px' }}>
        {sector.name}
      </p>

      <div className="mt-auto">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-mono font-bold" style={{ color: colors.text }}>
            {sector.density}%
          </span>
          <span
            className="text-xs px-1 rounded"
            style={{ background: colors.bg, color: colors.text, fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px' }}
          >
            {sector.status}
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(100, sector.density)}%`,
              background: sector.density >= 90 ? 'linear-gradient(90deg, #7b1fa2, #d500f9)'
                : sector.density >= 75 ? 'linear-gradient(90deg, #b71c1c, #ff1744)'
                : sector.density >= 50 ? 'linear-gradient(90deg, #e65100, #ffeb3b)'
                : 'linear-gradient(90deg, #1b5e20, #00e676)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function SectorDetailPanel({ sector, onClose, onCloseSector, onOpenSector }) {
  if (!sector) return null;
  const colors = getStatusColor(sector.status);

  return (
    <div
      className="glass-card p-5 flex flex-col gap-4"
      style={{ border: `1px solid ${colors.border}`, minWidth: '280px' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{ZONE_ICONS[sector.zone]}</span>
            <span className="text-xs font-mono" style={{ color: colors.text }}>{sector.sectorId}</span>
          </div>
          <h3 className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>{sector.name}</h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{sector.zone} Zone</p>
        </div>
        <button onClick={onClose} style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>✕</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Status', value: sector.status, color: colors.text },
          { label: 'Density', value: `${sector.density}%`, color: colors.text },
          { label: 'Occupancy', value: sector.currentOccupancy?.toLocaleString(), color: 'var(--gold)' },
          { label: 'Capacity', value: sector.capacity?.toLocaleString(), color: 'var(--text-secondary)' },
          { label: 'Inflow', value: `${sector.inflow}/min`, color: 'var(--red)' },
          { label: 'Outflow', value: `${sector.outflow}/min`, color: 'var(--green)' },
        ].map((item) => (
          <div key={item.label} className="p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
            <p className="text-sm font-bold font-mono" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>RESOURCES DEPLOYED</p>
        <div className="flex gap-3">
          <div className="flex-1 p-2 rounded text-center" style={{ background: 'var(--bg-surface)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>👮 Police</p>
            <p className="font-bold" style={{ color: 'var(--accent)' }}>{sector.resourcesDeployed?.police}</p>
          </div>
          <div className="flex-1 p-2 rounded text-center" style={{ background: 'var(--bg-surface)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>🏥 Medics</p>
            <p className="font-bold" style={{ color: '#e91e63' }}>{sector.resourcesDeployed?.medics}</p>
          </div>
          <div className="flex-1 p-2 rounded text-center" style={{ background: 'var(--bg-surface)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>🙋 Volunteers</p>
            <p className="font-bold" style={{ color: 'var(--green)' }}>{sector.resourcesDeployed?.volunteers}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {!sector.isClosed ? (
          <button className="btn-danger flex-1 text-xs" onClick={() => onCloseSector(sector.sectorId)}>
            🔒 Close Sector
          </button>
        ) : (
          <button className="btn-success flex-1 text-xs" onClick={() => onOpenSector(sector.sectorId)}>
            🔓 Reopen Sector
          </button>
        )}
      </div>
    </div>
  );
}

export default function SectorMap() {
  const { sectors, closeSector, openSector } = useApp();
  const [selectedSector, setSelectedSector] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const statusCounts = {
    ALL: sectors.length,
    GREEN: sectors.filter((s) => s.status === 'GREEN').length,
    YELLOW: sectors.filter((s) => s.status === 'YELLOW').length,
    RED: sectors.filter((s) => s.status === 'RED').length,
    CRITICAL: sectors.filter((s) => s.status === 'CRITICAL').length,
    CLOSED: sectors.filter((s) => s.isClosed).length,
  };

  const filtered = filterStatus === 'ALL' ? sectors : filterStatus === 'CLOSED'
    ? sectors.filter((s) => s.isClosed)
    : sectors.filter((s) => s.status === filterStatus);

  const gridSectors = [...filtered].sort((a, b) => {
    const ax = a.coordinates?.x || 0, ay = a.coordinates?.y || 0;
    const bx = b.coordinates?.x || 0, by = b.coordinates?.y || 0;
    return ay !== by ? ay - by : ax - bx;
  });

  const maxX = sectors.length > 0 ? Math.max(...sectors.map((s) => s.coordinates?.x || 0)) : 1;
  const maxY = sectors.length > 0 ? Math.max(...sectors.map((s) => s.coordinates?.y || 0)) : 1;

  const gridCells = [];
  for (let y = 1; y <= maxY; y++) {
    for (let x = 1; x <= maxX; x++) {
      const found = gridSectors.find((s) => s.coordinates?.x === x && s.coordinates?.y === y);
      gridCells.push({ x, y, sector: found || null });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h2 className="font-display font-bold tracking-wider" style={{ color: 'var(--accent)' }}>
            MAHAKUMBH SECTOR HEATMAP — UJJAIN 2028
          </h2>
          <div className="flex-1" />
          {['ALL', 'GREEN', 'YELLOW', 'RED', 'CRITICAL', 'CLOSED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
              style={{
                background: filterStatus === status
                  ? status === 'GREEN' ? 'rgba(0,230,118,0.2)'
                    : status === 'YELLOW' ? 'rgba(255,235,59,0.2)'
                    : status === 'RED' ? 'rgba(255,23,68,0.2)'
                    : status === 'CRITICAL' ? 'rgba(213,0,249,0.2)'
                    : status === 'CLOSED' ? 'rgba(84,110,122,0.2)'
                    : 'rgba(255,107,0,0.2)'
                  : 'var(--bg-surface)',
                color: filterStatus === status
                  ? status === 'GREEN' ? 'var(--green)'
                    : status === 'YELLOW' ? 'var(--yellow)'
                    : status === 'RED' ? 'var(--red)'
                    : status === 'CRITICAL' ? '#d500f9'
                    : status === 'CLOSED' ? '#78909c'
                    : 'var(--accent)'
                  : 'var(--text-secondary)',
                border: `1px solid ${filterStatus === status ? 'currentColor' : 'var(--border)'}`,
              }}
            >
              {status} ({statusCounts[status]})
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
          {[['🟢', 'GREEN', '< 50% — Safe'], ['🟡', 'YELLOW', '50–75% — Caution'], ['🔴', 'RED', '75–90% — High Risk'], ['🟣', 'CRITICAL', '> 90% — Danger']].map(([icon, label, desc]) => (
            <span key={label} className="flex items-center gap-1">
              {icon} <strong>{label}</strong>: {desc}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-5">
        <div className="flex-1 glass-card p-4">
          <h3 className="font-display text-sm tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>
            SPATIAL GRID MAP — REAL-TIME DENSITY
          </h3>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${maxX}, 1fr)` }}
          >
            {gridCells.map(({ x, y, sector }) => (
              sector ? (
                <SectorCell
                  key={sector.sectorId}
                  sector={sector}
                  onClick={setSelectedSector}
                  isSelected={selectedSector?.sectorId === sector.sectorId}
                />
              ) : (
                <div
                  key={`empty-${x}-${y}`}
                  className="rounded-xl"
                  style={{ minHeight: '110px', background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(30,45,74,0.5)' }}
                />
              )
            ))}
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 p-3 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>North ↑ Mangalnath / Mullapura</span>
              </div>
              <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span>West ← Dutt Akhara Zone</span>
                <span className="font-bold" style={{ color: 'var(--gold)' }}>RAM GHAT CENTRAL AXIS ⛵</span>
                <span>East → Ujjain Jn / Dewas Road →</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4" style={{ minWidth: '290px' }}>
          {selectedSector ? (
            <SectorDetailPanel
              sector={selectedSector}
              onClose={() => setSelectedSector(null)}
              onCloseSector={async (id) => { await closeSector(id); setSelectedSector(null); }}
              onOpenSector={async (id) => { await openSector(id); setSelectedSector(null); }}
            />
          ) : (
            <div className="glass-card p-5 flex flex-col items-center justify-center gap-3" style={{ minHeight: '200px' }}>
              <span className="text-3xl">🗺️</span>
              <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                Click any sector on the map to view live details and management options
              </p>
            </div>
          )}

          <div className="glass-card p-4">
            <h3 className="font-display text-sm tracking-wider mb-3" style={{ color: 'var(--accent)' }}>ZONE LEGEND</h3>
            <div className="flex flex-col gap-2">
              {Object.entries(ZONE_ICONS).map(([zone, icon]) => {
                const count = sectors.filter((s) => s.zone === zone).length;
                return (
                  <div key={zone} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span>{icon}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{zone}</span>
                    </span>
                    <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{count} sectors</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="font-display text-sm tracking-wider mb-3" style={{ color: 'var(--accent)' }}>QUICK STATS</h3>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Total Capacity:</span>
                <span className="font-mono" style={{ color: 'var(--gold)' }}>
                  {sectors.length > 0 ? (sectors.reduce((s, sec) => s + sec.capacity, 0) / 1000).toFixed(0) : 0}K
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Current Load:</span>
                <span className="font-mono" style={{ color: 'var(--accent)' }}>
                  {sectors.length > 0 ? (sectors.reduce((s, sec) => s + sec.currentOccupancy, 0) / 1000).toFixed(0) : 0}K
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Net Inflow:</span>
                <span className="font-mono" style={{ color: 'var(--red)' }}>
                  +{sectors.length > 0 ? (sectors.reduce((s, sec) => s + (sec.inflow - sec.outflow), 0)).toLocaleString() : 0}/min
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}