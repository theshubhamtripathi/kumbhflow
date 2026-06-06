const Sector = require('../models/Sector');
const Alert = require('../models/Alert');

function getStatusFromDensity(density) {
  if (density >= 90) return 'CRITICAL';
  if (density >= 75) return 'RED';
  if (density >= 50) return 'YELLOW';
  return 'GREEN';
}

function getTimeMultiplier() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour <= 7) return 1.8;
  if (hour >= 8 && hour <= 11) return 1.5;
  if (hour >= 12 && hour <= 15) return 1.2;
  if (hour >= 16 && hour <= 19) return 1.4;
  if (hour >= 20 && hour <= 23) return 0.9;
  return 0.6;
}

async function simulateCrowdUpdate() {
  const sectors = await Sector.find({ isClosed: false });
  const timeMultiplier = getTimeMultiplier();
  const shahiSnanBoost = Math.random() > 0.85 ? 1.3 : 1.0;
  const updatedSectors = [];

  for (const sector of sectors) {
    const fluctuation = (Math.random() - 0.48) * 0.08 * timeMultiplier * shahiSnanBoost;
    let newOccupancy = sector.currentOccupancy * (1 + fluctuation);
    newOccupancy = Math.max(0, Math.min(sector.capacity * 0.98, newOccupancy));

    const newDensity = (newOccupancy / sector.capacity) * 100;
    const newStatus = getStatusFromDensity(newDensity);

    const inflowChange = Math.floor(Math.random() * 800 * timeMultiplier) + 200;
    const outflowChange = Math.floor(Math.random() * 700 * timeMultiplier) + 200;

    await Sector.findByIdAndUpdate(sector._id, {
      currentOccupancy: Math.round(newOccupancy),
      density: parseFloat(newDensity.toFixed(1)),
      status: newStatus,
      inflow: inflowChange,
      outflow: outflowChange,
      lastUpdated: new Date(),
    });

    updatedSectors.push({
      sectorId: sector.sectorId,
      name: sector.name,
      currentOccupancy: Math.round(newOccupancy),
      density: parseFloat(newDensity.toFixed(1)),
      status: newStatus,
      inflow: inflowChange,
      outflow: outflowChange,
    });

    if (newDensity >= 90) {
      const existingAlert = await Alert.findOne({
        sectorId: sector.sectorId,
        type: 'STAMPEDE_RISK',
        isActive: true,
      });
      if (!existingAlert) {
        await Alert.create({
          alertId: `ALT-${Date.now()}-${sector.sectorId}`,
          type: 'STAMPEDE_RISK',
          severity: 'CRITICAL',
          sectorId: sector.sectorId,
          sectorName: sector.name,
          message: `CRITICAL: ${sector.name} at ${newDensity.toFixed(1)}% capacity. Immediate intervention required.`,
          isActive: true,
          metadata: { density: newDensity, occupancy: Math.round(newOccupancy) },
        });
      }
    }
  }

  const allSectors = await Sector.find();
  const totalPilgrims = allSectors.reduce((sum, s) => sum + s.currentOccupancy, 0);
  const criticalZones = allSectors.filter((s) => s.status === 'CRITICAL' || s.status === 'RED').length;
  const activeAlerts = await Alert.countDocuments({ isActive: true });

  return {
    sectors: updatedSectors,
    summary: {
      totalPilgrims,
      criticalZones,
      activeAlerts,
      safetyIndex: Math.max(0, 100 - criticalZones * 12 - activeAlerts * 5),
      timestamp: new Date().toISOString(),
    },
  };
}

module.exports = { simulateCrowdUpdate };