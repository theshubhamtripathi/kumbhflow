import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const SHAHI_DATES = [
  { date: '2028-04-09', name: 'Chaitra Purnima (First Snan)', expected: '35L', risk: 'EXTREME' },
  { date: '2028-04-22', name: 'Akshaya Tritiya (Main Shahi Snan)', expected: '60L', risk: 'EXTREME' },
  { date: '2028-05-06', name: 'Vaishakha Shukla Ekadashi', expected: '45L', risk: 'EXTREME' },
  { date: '2028-05-08', name: 'Mohini Ekadashi Snan', expected: '40L', risk: 'EXTREME' },
  { date: '2028-05-22', name: 'Jyeshtha Purnima (Pramukh Snan)', expected: '30L', risk: 'EXTREME' },
];

function StatusBadge({ status }) {
  const colors = {
    CRITICAL: { bg: 'rgba(213,0,249,0.2)', color: '#d500f9' },
    RED: { bg: 'rgba(255,23,68,0.2)', color: '#ff1744' },
    YELLOW: { bg: 'rgba(255,235,59,0.2)', color: '#ffeb3b' },
    GREEN: { bg: 'rgba(0,230,118,0.2)', color: '#00e676' },
    EXTREME: { bg: 'rgba(213,0,249,0.2)', color: '#d500f9' },
    HIGH: { bg: 'rgba(255,23,68,0.2)', color: '#ff1744' },
    MEDIUM: { bg: 'rgba(255,235,59,0.2)', color: '#ffeb3b' },
    LOW: { bg: 'rgba(0,230,118,0.2)', color: '#00e676' },
  };
  const c = colors[status] || colors.LOW;
  return (
    <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: c.bg, color: c.color }}>
      {status}
    </span>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-lg text-xs" style={{ background: '#0a0e1a', border: '1px solid var(--border)' }}>
        <p className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-mono">
            {p.name}: {p.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function PredictionEngine() {
  const [forecasts, setForecasts] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [overallRisk, setOverallRisk] = useState('');
  const [isShahiDay, setIsShahiDay] = useState(false);
  const [hours, setHours] = useState(12);

  const runForecast = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/predictions/forecast?date=${selectedDate}&hours=${hours}`);
      setForecasts(res.data.data.forecasts);
      setOverallRisk(res.data.data.overallRiskLevel);
      setIsShahiDay(res.data.data.isShahiSnanDay);
      if (res.data.data.forecasts.length > 0) {
        setSelectedSector(res.data.data.forecasts[0]);
      }
    } catch (err) {
      console.error('Forecast error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    runForecast();
  }, []);

  const riskColors = {
    EXTREME: '#d500f9', HIGH: '#ff1744', MEDIUM: '#ffeb3b', LOW: '#00e676',
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="glass-card p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <h2 className="font-display font-bold tracking-wider" style={{ color: 'var(--accent)' }}>
              AI CONGESTION PREDICTION ENGINE
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Historical pattern analysis + time-of-day modelling + Shahi Snan event amplification
            </p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Forecast Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-sm"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Hours Ahead</label>
              <select
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-sm"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              >
                <option value={6}>6 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours</option>
              </select>
            </div>
            <button className="btn-primary mt-4" onClick={runForecast} disabled={loading}>
              {loading ? '⟳ Modelling...' : '▶ Run Forecast'}
            </button>
          </div>
        </div>

        {isShahiDay && (
          <div
            className="mt-4 p-3 rounded-lg flex items-center gap-3 critical-pulse"
            style={{ background: 'rgba(213,0,249,0.1)', border: '1px solid rgba(213,0,249,0.4)' }}
          >
            <span className="text-xl">🚨</span>
            <div>
              <p className="text-sm font-bold" style={{ color: '#d500f9' }}>SHAHI SNAN DAY DETECTED</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Crowd multiplier: 1.6×–2.1× normal. All response protocols should be activated 6 hours before peak.
              </p>
            </div>
          </div>
        )}
      </div>

      {overallRisk && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            className="glass-card p-4 text-center"
            style={{ border: `1px solid ${riskColors[overallRisk] || '#888'}33` }}
          >
            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>OVERALL RISK</p>
            <p className="text-2xl font-bold font-display" style={{ color: riskColors[overallRisk] }}>
              {overallRisk}
            </p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>SECTORS FORECASTED</p>
            <p className="text-2xl font-bold font-mono" style={{ color: 'var(--gold)' }}>{forecasts.length}</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>HIGH-RISK PREDICTED</p>
            <p className="text-2xl font-bold font-mono" style={{ color: 'var(--red)' }}>
              {forecasts.filter((f) => f.peakStatus === 'RED' || f.peakStatus === 'CRITICAL').length}
            </p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>AVG CONFIDENCE</p>
            <p className="text-2xl font-bold font-mono" style={{ color: 'var(--green)' }}>
              {forecasts.length > 0 ? (forecasts.reduce((s, f) => s + f.confidence, 0) / forecasts.length).toFixed(0) : 0}%
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-5">
        <div className="flex flex-col gap-3" style={{ minWidth: '280px' }}>
          <div className="glass-card p-4">
            <h3 className="font-display text-sm tracking-wider mb-3" style={{ color: 'var(--accent)' }}>SECTOR FORECASTS</h3>
            <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '400px' }}>
              {forecasts.map((f) => (
                <button
                  key={f.sectorId}
                  onClick={() => setSelectedSector(f)}
                  className="w-full text-left p-3 rounded-lg transition-all"
                  style={{
                    background: selectedSector?.sectorId === f.sectorId ? 'rgba(255,107,0,0.1)' : 'var(--bg-surface)',
                    border: `1px solid ${selectedSector?.sectorId === f.sectorId ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{f.sectorName}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Peak @ {f.peakExpectedAt}</p>
                    </div>
                    <StatusBadge status={f.peakStatus} />
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>Peak density</span>
                      <span className="font-mono" style={{ color: 'var(--gold)' }}>{f.peakDensity}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, f.peakDensity)}%`,
                          background: f.peakDensity >= 90 ? '#d500f9' : f.peakDensity >= 75 ? '#ff1744' : f.peakDensity >= 50 ? '#ffeb3b' : '#00e676',
                        }}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          {selectedSector ? (
            <>
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {selectedSector.sectorName}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {hours}-Hour Density Forecast | Confidence: {selectedSector.confidence}%
                    </p>
                  </div>
                  <StatusBadge status={selectedSector.peakStatus} />
                </div>

                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={selectedSector.hourlyForecast}>
                    <defs>
                      <linearGradient id="densityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ff6b00" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
                    <XAxis dataKey="label" stroke="#8899bb" tick={{ fontSize: 9, fill: '#8899bb' }} />
                    <YAxis domain={[0, 100]} stroke="#8899bb" tick={{ fontSize: 9, fill: '#8899bb' }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={75} stroke="#ff1744" strokeDasharray="5 5" label={{ value: 'RED', fill: '#ff1744', fontSize: 9 }} />
                    <ReferenceLine y={90} stroke="#d500f9" strokeDasharray="5 5" label={{ value: 'CRITICAL', fill: '#d500f9', fontSize: 9 }} />
                    <Area type="monotone" dataKey="density" name="Density" stroke="#ff6b00" fill="url(#densityGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>

                <div
                  className="mt-4 p-3 rounded-lg"
                  style={{
                    background: selectedSector.peakDensity >= 85 ? 'rgba(255,23,68,0.08)' : 'rgba(255,235,59,0.05)',
                    border: `1px solid ${selectedSector.peakDensity >= 85 ? 'rgba(255,23,68,0.3)' : 'rgba(255,235,59,0.2)'}`,
                  }}
                >
                  <p className="text-xs font-bold mb-1" style={{ color: selectedSector.peakDensity >= 85 ? 'var(--red)' : 'var(--yellow)' }}>
                    AI RECOMMENDATION
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{selectedSector.recommendation}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Current Density', value: `${selectedSector.currentDensity}%`, color: 'var(--accent)' },
                  { label: 'Peak Expected', value: selectedSector.peakExpectedAt, color: 'var(--red)' },
                  { label: 'Peak Density', value: `${selectedSector.peakDensity}%`, color: '#d500f9' },
                ].map((m) => (
                  <div key={m.label} className="glass-card p-4 text-center">
                    <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{m.label}</p>
                    <p className="text-xl font-bold font-mono" style={{ color: m.color }}>{m.value}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="glass-card p-10 flex items-center justify-center">
              <p style={{ color: 'var(--text-secondary)' }}>Run forecast and select a sector to view hourly predictions</p>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-display font-semibold tracking-wider mb-4" style={{ color: 'var(--accent)' }}>
          SHAHI SNAN CALENDAR — EXTREME RISK DAYS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SHAHI_DATES.map((item) => (
            <div
              key={item.date}
              className="p-4 rounded-xl"
              style={{ background: 'rgba(213,0,249,0.07)', border: '1px solid rgba(213,0,249,0.2)', cursor: 'pointer' }}
              onClick={() => { setSelectedDate(item.date); runForecast(); }}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-mono" style={{ color: '#d500f9' }}>{item.date}</p>
                <StatusBadge status={item.risk} />
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Expected: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{item.expected} pilgrims</span>
              </p>
              <p className="text-xs mt-2 opacity-60" style={{ color: 'var(--text-secondary)' }}>Click to model this day →</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}