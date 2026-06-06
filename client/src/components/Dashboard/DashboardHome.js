import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

function MetricCard({ label, value, sub, color, icon, pulse }) {
  return (
    <div
      className="metric-card glass-card p-5 flex flex-col gap-2"
      style={{ border: `1px solid ${color}33` }}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p
        className={`text-3xl font-bold font-mono ${pulse ? 'critical-pulse' : ''}`}
        style={{ color }}
      >
        {value}
      </p>
      {sub && <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
    </div>
  );
}

function AlertFeed({ alerts, resolveAlert }) {
  const severityColor = { CRITICAL: '#d500f9', HIGH: '#ff1744', MEDIUM: '#ffeb3b', LOW: '#00e676' };
  const severityBg = { CRITICAL: 'rgba(213,0,249,0.08)', HIGH: 'rgba(255,23,68,0.08)', MEDIUM: 'rgba(255,235,59,0.08)', LOW: 'rgba(0,230,118,0.08)' };

  return (
    <div className="glass-card p-4 flex flex-col gap-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm tracking-wider" style={{ color: 'var(--accent)' }}>
          LIVE ALERT FEED
        </h3>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,23,68,0.2)', color: '#ff1744' }}
        >
          {alerts.length} active
        </span>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '320px' }}>
        {alerts.length === 0 && (
          <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
            <p className="text-2xl mb-2">✓</p>
            <p className="text-sm">All systems nominal</p>
          </div>
        )}
        {alerts.map((alert) => (
          <div
            key={alert.alertId}
            className="alert-item p-3 rounded-lg"
            style={{
              background: severityBg[alert.severity] || 'rgba(255,255,255,0.03)',
              borderLeftColor: severityColor[alert.severity] || '#8899bb',
              borderLeft: `3px solid ${severityColor[alert.severity] || '#8899bb'}`,
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs px-1.5 py-0.5 rounded font-bold"
                    style={{ background: severityColor[alert.severity] + '33', color: severityColor[alert.severity] }}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {alert.sectorName}
                  </span>
                </div>
                <p className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>
                  {alert.message}
                </p>
                <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
                  {new Date(alert.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => resolveAlert(alert.alertId)}
                className="text-xs px-2 py-1 rounded flex-shrink-0"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                Resolve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-lg text-xs" style={{ background: '#0a0e1a', border: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="font-mono">
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function DashboardHome() {
  const { liveMetrics, alerts, resolveAlert, analytics, sectors } = useApp();

  const statusData = analytics
    ? [
        { name: 'Green', value: analytics.statusBreakdown.GREEN, color: '#00e676' },
        { name: 'Yellow', value: analytics.statusBreakdown.YELLOW, color: '#ffeb3b' },
        { name: 'Red', value: analytics.statusBreakdown.RED, color: '#ff1744' },
        { name: 'Critical', value: analytics.statusBreakdown.CRITICAL, color: '#d500f9' },
      ]
    : [];

  const topRiskSectors = (analytics?.topRiskSectors || []).slice(0, 5);
  const hourlyTrend = analytics?.hourlyTrend || [];
  const bottlenecks = analytics?.bottlenecks || [];

  const safetyColor =
    liveMetrics.safetyIndex > 70 ? 'var(--green)' : liveMetrics.safetyIndex > 45 ? 'var(--yellow)' : 'var(--red)';

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Pilgrims"
          value={`${(liveMetrics.totalPilgrims / 1000).toFixed(0)}K`}
          sub="Currently in Mela grounds"
          color="var(--gold)"
          icon="🕉️"
        />
        <MetricCard
          label="High-Risk Zones"
          value={liveMetrics.criticalZones}
          sub="Red + Critical sectors"
          color="var(--red)"
          icon="⚠️"
          pulse={liveMetrics.criticalZones > 2}
        />
        <MetricCard
          label="Active Alerts"
          value={liveMetrics.activeAlerts}
          sub="Requiring attention"
          color="#d500f9"
          icon="🚨"
          pulse={liveMetrics.activeAlerts > 3}
        />
        <MetricCard
          label="Safety Index"
          value={`${liveMetrics.safetyIndex}%`}
          sub="Overall safety score"
          color={safetyColor}
          icon="🛡️"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-sm tracking-wider" style={{ color: 'var(--accent)' }}>
              PILGRIM DENSITY — 12HR TREND
            </h3>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(0,230,118,0.15)', color: 'var(--green)' }}>
              LIVE
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={hourlyTrend}>
              <defs>
                <linearGradient id="pilgrimGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff6b00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
              <XAxis dataKey="hour" stroke="#8899bb" tick={{ fontSize: 10, fill: '#8899bb' }} />
              <YAxis stroke="#8899bb" tick={{ fontSize: 10, fill: '#8899bb' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="pilgrims" name="Pilgrims" stroke="#ff6b00" fill="url(#pilgrimGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-4">
          <h3 className="font-display font-semibold text-sm tracking-wider mb-4" style={{ color: 'var(--accent)' }}>
            SECTOR STATUS BREAKDOWN
          </h3>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ background: '#0a0e1a', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {item.name}: <span style={{ color: item.color }}>{item.value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="glass-card p-4">
          <h3 className="font-display font-semibold text-sm tracking-wider mb-4" style={{ color: 'var(--accent)' }}>
            TOP RISK SECTORS
          </h3>
          <div className="flex flex-col gap-3">
            {topRiskSectors.map((s, i) => (
              <div key={s.sectorId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {s.name}
                  </span>
                  <span
                    className="text-xs font-mono font-bold"
                    style={{
                      color:
                        s.status === 'CRITICAL' ? '#d500f9'
                          : s.status === 'RED' ? 'var(--red)'
                          : s.status === 'YELLOW' ? 'var(--yellow)'
                          : 'var(--green)',
                    }}
                  >
                    {s.density}%
                  </span>
                </div>
                <div className="density-bar">
                  <div
                    className="density-fill"
                    style={{
                      width: `${s.density}%`,
                      background:
                        s.density >= 90 ? 'linear-gradient(90deg, #7b1fa2, #d500f9)'
                          : s.density >= 75 ? 'linear-gradient(90deg, #b71c1c, #ff1744)'
                          : s.density >= 50 ? 'linear-gradient(90deg, #e65100, #ffeb3b)'
                          : 'linear-gradient(90deg, #1b5e20, #00e676)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="font-display font-semibold text-sm tracking-wider mb-4" style={{ color: 'var(--accent)' }}>
            ACTIVE BOTTLENECKS
          </h3>
          {bottlenecks.length === 0 ? (
            <div className="text-center py-6" style={{ color: 'var(--text-secondary)' }}>
              <p>No active bottlenecks</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {bottlenecks.slice(0, 4).map((b) => (
                <div key={b.sectorId} className="p-3 rounded-lg" style={{ background: 'rgba(255,23,68,0.07)', border: '1px solid rgba(255,23,68,0.2)' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{b.name}</p>
                  <div className="flex gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>↑ IN: <span style={{ color: 'var(--red)' }}>{b.inflow}/min</span></span>
                    <span>↓ OUT: <span style={{ color: 'var(--green)' }}>{b.outflow}/min</span></span>
                    <span>NET: <span style={{ color: 'var(--yellow)' }}>+{b.netAccumulation}</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <AlertFeed alerts={alerts} resolveAlert={resolveAlert} />
      </div>

      <div className="glass-card p-4">
        <h3 className="font-display font-semibold text-sm tracking-wider mb-4" style={{ color: 'var(--accent)' }}>
          INFLOW vs OUTFLOW — ALL SECTORS
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={sectors.slice(0, 10).map((s) => ({ name: s.sectorId, inflow: s.inflow, outflow: s.outflow }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
            <XAxis dataKey="name" stroke="#8899bb" tick={{ fontSize: 10, fill: '#8899bb' }} />
            <YAxis stroke="#8899bb" tick={{ fontSize: 10, fill: '#8899bb' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="inflow" name="Inflow" fill="#ff1744" opacity={0.8} radius={[2, 2, 0, 0]} />
            <Bar dataKey="outflow" name="Outflow" fill="#00e676" opacity={0.8} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}