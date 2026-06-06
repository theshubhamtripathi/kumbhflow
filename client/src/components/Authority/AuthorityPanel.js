import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function AuthorityPanel() {
  const { sectors, alerts, broadcastEmergency, deployResources } = useApp();
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedTargetSectors, setSelectedTargetSectors] = useState([]);
  const [resourceEdits, setResourceEdits] = useState({});
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Handle mass emergency notification dispatch
  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    
    setIsBroadcasting(true);
    broadcastEmergency(broadcastMessage, selectedTargetSectors);
    
    // Reset form states after deployment
    setBroadcastMessage('');
    setSelectedTargetSectors([]);
    alert('🚨 Emergency broadcast transmitted across Prayagraj network lines.');
    setIsBroadcasting(false);
  };

  // Toggle sectors targeted for emergency rerouting corridors
  const handleToggleTargetSector = (sectorId) => {
    setSelectedTargetSectors(prev => 
      prev.includes(sectorId) 
        ? prev.filter(id => id !== sectorId) 
        : [...prev, sectorId]
    );
  };

  // Handle resource inputs state shifts locally before hitting the database API
  const handleResourceInputChange = (sectorId, field, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setResourceEdits(prev => ({
      ...prev,
      [sectorId]: {
        ...prev[sectorId],
        [field]: numValue
      }
    }));
  };

  // Save resource re-allocations to backend MongoDB storage layers
  const handleSaveResources = async (sectorId, currentResources) => {
    const updates = {
      police: resourceEdits[sectorId]?.police !== undefined ? resourceEdits[sectorId].police : currentResources.police,
      medics: resourceEdits[sectorId]?.medics !== undefined ? resourceEdits[sectorId].medics : currentResources.medics,
      volunteers: resourceEdits[sectorId]?.volunteers !== undefined ? resourceEdits[sectorId].volunteers : currentResources.volunteers,
    };

    const success = await deployResources(sectorId, updates);
    if (success) {
      alert(`👮 Personnel rosters updated successfully for Sector ${sectorId}.`);
    } else {
      alert('❌ Resource re-allocation transmission failed.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* SECTION A: MASS EMERGENCY BROADCAST INTERFACE */}
      <div className="glass-card p-5 border" style={{ borderColor: 'var(--border)' }}>
        <h2 className="font-display font-bold tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
          🚨 CRITICAL INCIDENT BROADCAST SYSTEM
        </h2>
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
          Transmit rapid safety advisory overrides and mandatory re-routing corridors directly to field networks.
        </p>

        <form onSubmit={handleSendBroadcast} className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-xs font-semibold tracking-wider text-slate-400">EMERGENCY BROADCAST MESSAGE</label>
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Type urgent routing guidance, stampede advisory instructions, or perimeter closures..."
              className="p-3 rounded-lg text-sm bg-slate-950 border text-slate-200"
              style={{ minHeight: '100px', borderColor: 'var(--border)' }}
            />
          </div>

          <div className="flex flex-col gap-2 lg:w-1/3">
            <label className="text-xs font-semibold tracking-wider text-slate-400">TARGET CORRIDORS / SECTORS</label>
            <div className="border rounded-lg p-2 overflow-y-auto flex flex-col gap-1.5" style={{ height: '100px', borderColor: 'var(--border)', background: 'var(--bg-dark)' }}>
              {sectors.map(sec => (
                <label key={sec.sectorId} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTargetSectors.includes(sec.sectorId)}
                    onChange={() => handleToggleTargetSector(sec.sectorId)}
                    className="rounded text-orange-500 bg-slate-900 border-slate-700"
                  />
                  <span>[{sec.sectorId}] {sec.name}</span>
                </label>
              ))}
            </div>
            <button 
              type="submit" 
              className="btn-danger w-full mt-2 font-bold py-2.5 uppercase tracking-widest text-xs"
              disabled={isBroadcasting || !broadcastMessage.trim()}
            >
              ⚡ Transmit Air Broadcast
            </button>
          </div>
        </form>
      </div>

      {/* SECTION B: RESOURCE ALLOCATION MATRIX CONTROL */}
      <div className="glass-card p-4 border" style={{ borderColor: 'var(--border)' }}>
        <h3 className="font-display font-semibold text-sm tracking-wider mb-4" style={{ color: 'var(--accent)' }}>
          📋 FIELD RESPONSE RESOURCE DEPLOYMENT LOGS
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b text-slate-400 uppercase tracking-wider font-semibold" style={{ borderColor: 'var(--border)' }}>
                <th className="py-2 px-3">Sector</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">👮 Police Force</th>
                <th className="py-2 px-3">🏥 Medical Staff</th>
                <th className="py-2 px-3">🙋 Volunteers</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sectors.map((sector) => {
                const currentEdits = resourceEdits[sector.sectorId] || {};
                const densityColor = sector.status === 'CRITICAL' ? '#d500f9' : sector.status === 'RED' ? 'var(--red)' : sector.status === 'YELLOW' ? 'var(--yellow)' : 'var(--green)';

                return (
                  <tr key={sector.sectorId} className="border-b hover:bg-slate-900/40 transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-200">{sector.name}</p>
                      <p className="text-slate-500 font-mono text-[10px]">{sector.sectorId} · {sector.zone}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold font-mono" style={{ color: densityColor }}>
                        {sector.density}% {sector.status}
                      </span>
                    </td>
                    
                    {/* Police Input */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        value={currentEdits.police !== undefined ? currentEdits.police : sector.resourcesDeployed?.police || 0}
                        onChange={(e) => handleResourceInputChange(sector.sectorId, 'police', e.target.value)}
                        className="w-16 px-1.5 py-1 rounded bg-slate-950 border border-slate-800 text-center text-orange-400 font-bold"
                      />
                    </td>

                    {/* Medics Input */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        value={currentEdits.medics !== undefined ? currentEdits.medics : sector.resourcesDeployed?.medics || 0}
                        onChange={(e) => handleResourceInputChange(sector.sectorId, 'medics', e.target.value)}
                        className="w-16 px-1.5 py-1 rounded bg-slate-950 border border-slate-800 text-center text-pink-500 font-bold"
                      />
                    </td>

                    {/* Volunteers Input */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        value={currentEdits.volunteers !== undefined ? currentEdits.volunteers : sector.resourcesDeployed?.volunteers || 0}
                        onChange={(e) => handleResourceInputChange(sector.sectorId, 'volunteers', e.target.value)}
                        className="w-16 px-1.5 py-1 rounded bg-slate-950 border border-slate-800 text-center text-emerald-400 font-bold"
                      />
                    </td>

                    {/* Dispatch Dispatch Button */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleSaveResources(sector.sectorId, sector.resourcesDeployed)}
                        className="btn-success text-[11px] px-3 py-1 rounded font-semibold transition-all"
                      >
                        ⚡ Dispatch Force
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}