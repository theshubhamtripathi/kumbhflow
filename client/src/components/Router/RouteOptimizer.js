import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StatusDot({ status }) {
  const colors = { GREEN: '#00e676', YELLOW: '#ffeb3b', RED: '#ff1744', CRITICAL: '#d500f9', CLOSED: '#546e7a' };
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{ background: colors[status] || '#888', boxShadow: `0 0 6px ${colors[status] || '#888'}` }}
    />
  );
}

function RoutePathDisplay({ route, label, isPrimary }) {
  if (!route) return null;
  const safetyColors = { SAFE: '#00e676', MODERATE: '#ffeb3b', RISKY: '#ff1744' };
  const safetyColor = safetyColors[route.safetyRating] || '#888';

  return (
    <div
      className="p-4 rounded-xl flex flex-col gap-4"
      style={{
        background: isPrimary ? 'rgba(255,107,0,0.06)' : 'rgba(30,45,74,0.4)',
        border: `1px solid ${isPrimary ? 'rgba(255,107,0,0.3)' : 'var(--border)'}`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{isPrimary ? '⭐' : '🔀'}</span>
          <p className="font-semibold text-sm" style={{ color: isPrimary ? 'var(--accent)' : 'var(--text-secondary)' }}>
            {label}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded font-bold"
            style={{ background: `${safetyColor}22`, color: safetyColor }}
          >
            {route.safetyRating}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {route.path.map((stop, i) => (
          <React.Fragment key={stop.sectorId}>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${stop.status === 'GREEN' ? '#00e676' : stop.status === 'YELLOW' ? '#ffeb3b' : stop.status === 'RED' ? '#ff1744' : '#d500f9'}44`,
              }}
            >
              <StatusDot status={stop.status} />
              <div>
                <p className="text-xs font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
                  {stop.sectorId}
                </p>
                <p className="text-xs leading-none mt-0.5" style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
                  {stop.name?.split(' ').slice(0, 2).join(' ')}
                </p>
              </div>
              {stop.density > 60 && (
                <span className="text-xs" style={{ color: '#ffeb3b', fontSize: '10px' }}>⚠</span>
              )}
            </div>
            {i < route.path.length - 1 && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>→</span>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Stops</p>
          <p className="font-bold font-mono" style={{ color: 'var(--gold)' }}>{route.path.length}</p>
        </div>
        <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Est. Time</p>
          <p className="font-bold font-mono" style={{ color: 'var(--accent)' }}>{route.estimatedTime}</p>
        </div>
        <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Avg Density</p>
          <p className="font-bold font-mono" style={{ color: safetyColor }}>
            {route.averageDensity !== undefined ? `${route.averageDensity}%` : `${route.totalCost}`}
          </p>
        </div>
      </div>

      {route.path.filter((p) => p.warning).map((p) => (
        <div key={p.sectorId} className="text-xs p-2 rounded" style={{ background: 'rgba(255,235,59,0.1)', color: '#ffeb3b' }}>
          ⚠ {p.sectorId}: {p.warning}
        </div>
      ))}
    </div>
  );
}

export default function RouteOptimizer() {
  const [hubs, setHubs] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get('/api/routes/hubs').then((res) => {
      setHubs(res.data.data);
      if (res.data.data.length >= 2) {
        setFrom(res.data.data[0].sectorId);
        setTo(res.data.data[1].sectorId);
      }
    });
  }, []);

  const optimize = async () => {
    if (!from || !to || from === to) {
      setError('Please select two different sectors.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post('/api/routes/optimize', { fromSectorId: from, toSectorId: to });
      setResult(res.data);
      if (res.data.success) {
        const fromHub = hubs.find((h) => h.sectorId === from);
        const toHub = hubs.find((h) => h.sectorId === to);
        setHistory((prev) => [
          {
            from: fromHub?.name || from,
            to: toHub?.name || to,
            time: new Date().toLocaleTimeString(),
            safety: res.data.data?.primaryRoute?.safetyRating,
          },
          ...prev.slice(0, 4),
        ]);
      }
    } catch (err) {
      setError('Failed to compute route. Please try again.');
    }
    setLoading(false);
  };

  const statusColors = { GREEN: '#00e676', YELLOW: '#ffeb3b', RED: '#ff1744', CRITICAL: '#d500f9', CLOSED: '#546e7a' };

  return (
    <div className="flex flex-col gap-5">
      <div className="glass-card p-5">
        <h2 className="font-display font-bold tracking-wider mb-1" style={{ color: 'var(--accent)' }}>
          AI ROUTE OPTIMIZER — DIJKSTRA PATHFINDING
        </h2>
        <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>
          Computes the safest, least-congested path between hubs. Avoids RED and CRITICAL zones. Real-time density weighting.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              ORIGIN POINT
            </label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2.5 rounded-lg text-sm"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              <option value="">Select origin...</option>
              {hubs.map((h) => (
                <option key={h.sectorId} value={h.sectorId}>
                  [{h.sectorId}] {h.name} — {h.status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              DESTINATION
            </label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2.5 rounded-lg text-sm"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              <option value="">Select destination...</option>
              {hubs.map((h) => (
                <option key={h.sectorId} value={h.sectorId}>
                  [{h.sectorId}] {h.name} — {h.status}
                </option>
              ))}
            </select>
          </div>

          <button className="btn-primary py-2.5 text-base" onClick={optimize} disabled={loading}>
            {loading ? '⟳ Computing...' : '⚡ Find Safest Route'}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg text-sm" style={{ background: 'rgba(255,23,68,0.1)', color: 'var(--red)', border: '1px solid rgba(255,23,68,0.3)' }}>
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="flex flex-col gap-4">
          {!result.success && (
            <div className="glass-card p-5 text-center" style={{ border: '1px solid rgba(255,23,68,0.3)' }}>
              <p className="text-xl mb-2">🚫</p>
              <p className="font-bold" style={{ color: 'var(--red)' }}>{result.message}</p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{result.alternativeAction}</p>
            </div>
          )}

          {result.success && result.data && (
            <>
              <div
                className="p-4 rounded-xl"
                style={{
                  background: result.data.recommendation.includes('RISKY') ? 'rgba(255,23,68,0.07)'
                    : result.data.recommendation.includes('MODERATE') ? 'rgba(255,235,59,0.07)'
                    : 'rgba(0,230,118,0.07)',
                  border: `1px solid ${result.data.recommendation.includes('RISKY') ? 'rgba(255,23,68,0.3)'
                    : result.data.recommendation.includes('MODERATE') ? 'rgba(255,235,59,0.3)'
                    : 'rgba(0,230,118,0.3)'}`,
                }}
              >
                <p className="text-xs font-bold mb-1" style={{ color: 'var(--accent)' }}>ROUTE ADVISORY</p>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{result.data.recommendation}</p>
              </div>

              <div className="flex flex-col gap-4">
                <RoutePathDisplay route={result.data.primaryRoute} label="Primary Optimal Route" isPrimary={true} />
                {result.data.alternativeRoute && (
                  <RoutePathDisplay route={result.data.alternativeRoute} label="Alternative Route" isPrimary={false} />
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-card p-4">
          <h3 className="font-display text-sm tracking-wider mb-3" style={{ color: 'var(--accent)' }}>
            ALL SECTOR STATUS
          </h3>
          <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '300px' }}>
            {hubs.map((hub) => (
              <div
                key={hub.sectorId}
                className="flex items-center justify-between p-2.5 rounded-lg"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <StatusDot status={hub.status} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{hub.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{hub.sectorId} · {hub.zone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold" style={{ color: statusColors[hub.status] || '#888' }}>
                    {hub.density}%
                  </p>
                  <p className="text-xs" style={{ color: statusColors[hub.status] || '#888' }}>{hub.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="glass-card p-4">
            <h3 className="font-display text-sm tracking-wider mb-3" style={{ color: 'var(--accent)' }}>
              ALGORITHM INFO
            </h3>
            <div className="flex flex-col gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              {[
                ['Algorithm', 'Dijkstra Shortest Path (Modified)'],
                ['Weight Function', 'Density Cost + Status Penalty'],
                ['RED Zone Penalty', '+8 per segment'],
                ['CRITICAL Penalty', '+20 per segment (near-blocked)'],
                ['CLOSED Zones', 'Infinity cost (impassable)'],
                ['Update Freq.', 'Every 8 seconds (real-time)'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span>{k}:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="font-display text-sm tracking-wider mb-3" style={{ color: 'var(--accent)' }}>
                RECENT QUERIES
              </h3>
              <div className="flex flex-col gap-2">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded" style={{ background: 'var(--bg-surface)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {h.from} → {h.to}
                    </span>
                    <div className="flex items-center gap-2">
                      <span style={{ color: h.safety === 'SAFE' ? 'var(--green)' : h.safety === 'MODERATE' ? 'var(--yellow)' : 'var(--red)' }}>
                        {h.safety}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>{h.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}