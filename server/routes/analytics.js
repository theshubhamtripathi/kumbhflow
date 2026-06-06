const express = require('express');
const router = require('express').Router();
const Sector = require('../models/Sector');
const Alert = require('../models/Alert');

router.get('/overview', async (req, res) => {
  try {
    const sectors = await Sector.find();
    const alerts = await Alert.find({ isActive: true });

    const totalPilgrims = sectors.reduce((sum, s) => sum + s.currentOccupancy, 0);
    const totalCapacity = sectors.reduce((sum, s) => sum + s.capacity, 0);
    const overallDensity = totalCapacity > 0 ? (totalPilgrims / totalCapacity) * 100 : 0;

    const statusBreakdown = {
      CRITICAL: sectors.filter((s) => s.status === 'CRITICAL').length,
      RED: sectors.filter((s) => s.status === 'RED').length,
      YELLOW: sectors.filter((s) => s.status === 'YELLOW').length,
      GREEN: sectors.filter((s) => s.status === 'GREEN').length,
      CLOSED: sectors.filter((s) => s.status === 'CLOSED').length,
    };

    const alertsBySeverity = {
      CRITICAL: alerts.filter((a) => a.severity === 'CRITICAL').length,
      HIGH: alerts.filter((a) => a.severity === 'HIGH').length,
      MEDIUM: alerts.filter((a) => a.severity === 'MEDIUM').length,
      LOW: alerts.filter((a) => a.severity === 'LOW').length,
    };

    const bottlenecks = sectors
      .filter((s) => s.inflow > s.outflow * 1.3)
      .map((s) => ({
        sectorId: s.sectorId,
        name: s.name,
        inflow: s.inflow,
        outflow: s.outflow,
        netAccumulation: s.inflow - s.outflow,
      }))
      .sort((a, b) => b.netAccumulation - a.netAccumulation);

    const safetyIndex = Math.max(
      0,
      100 -
        statusBreakdown.CRITICAL * 20 -
        statusBreakdown.RED * 10 -
        statusBreakdown.YELLOW * 3 -
        alertsBySeverity.CRITICAL * 8 -
        alertsBySeverity.HIGH * 4
    );

    const totalResources = sectors.reduce(
      (acc, s) => ({
        police: acc.police + s.resourcesDeployed.police,
        medics: acc.medics + s.resourcesDeployed.medics,
        volunteers: acc.volunteers + s.resourcesDeployed.volunteers,
      }),
      { police: 0, medics: 0, volunteers: 0 }
    );

    const hourlyTrend = Array.from({ length: 12 }, (_, i) => {
      const hour = (new Date().getHours() - 11 + i + 24) % 24;
      const noise = 0.85 + Math.random() * 0.3;
      return {
        hour: `${String(hour).padStart(2, '0')}:00`,
        pilgrims: Math.round(totalPilgrims * noise * (0.7 + (i / 12) * 0.3)),
        density: parseFloat((overallDensity * noise).toFixed(1)),
      };
    });

    res.json({
      success: true,
      data: {
        totalPilgrims,
        totalCapacity,
        overallDensity: parseFloat(overallDensity.toFixed(1)),
        safetyIndex: parseFloat(safetyIndex.toFixed(0)),
        activeAlerts: alerts.length,
        bottlenecksCount: bottlenecks.length,
        statusBreakdown,
        alertsBySeverity,
        bottlenecks: bottlenecks.slice(0, 5),
        resources: totalResources,
        hourlyTrend,
        topRiskSectors: sectors
          .sort((a, b) => b.density - a.density)
          .slice(0, 5)
          .map((s) => ({ sectorId: s.sectorId, name: s.name, density: s.density, status: s.status })),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;