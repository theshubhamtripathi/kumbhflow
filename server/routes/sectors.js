const express = require('express');
const router = express.Router();
const Sector = require('../models/Sector');

router.get('/', async (req, res) => {
  try {
    const sectors = await Sector.find();
    res.json({ success: true, data: sectors });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:sectorId', async (req, res) => {
  try {
    const sector = await Sector.findOne({ sectorId: req.params.sectorId });
    if (!sector) return res.status(404).json({ success: false, error: 'Sector not found' });
    res.json({ success: true, data: sector });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:sectorId/close', async (req, res) => {
  try {
    const sector = await Sector.findOneAndUpdate(
      { sectorId: req.params.sectorId },
      { isClosed: true, status: 'CLOSED', lastUpdated: new Date() },
      { new: true }
    );
    if (!sector) return res.status(404).json({ success: false, error: 'Sector not found' });
    res.json({ success: true, data: sector, message: `Sector ${sector.name} has been closed.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:sectorId/open', async (req, res) => {
  try {
    const sector = await Sector.findOneAndUpdate(
      { sectorId: req.params.sectorId },
      { isClosed: false, status: 'GREEN', lastUpdated: new Date() },
      { new: true }
    );
    if (!sector) return res.status(404).json({ success: false, error: 'Sector not found' });
    res.json({ success: true, data: sector, message: `Sector ${sector.name} is now open.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:sectorId/resources', async (req, res) => {
  try {
    const { police, medics, volunteers } = req.body;
    const sector = await Sector.findOneAndUpdate(
      { sectorId: req.params.sectorId },
      { resourcesDeployed: { police, medics, volunteers }, lastUpdated: new Date() },
      { new: true }
    );
    if (!sector) return res.status(404).json({ success: false, error: 'Sector not found' });
    res.json({ success: true, data: sector });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/stats/summary', async (req, res) => {
  try {
    const sectors = await Sector.find();
    const total = sectors.reduce((sum, s) => sum + s.currentOccupancy, 0);
    const critical = sectors.filter((s) => s.status === 'CRITICAL').length;
    const red = sectors.filter((s) => s.status === 'RED').length;
    const yellow = sectors.filter((s) => s.status === 'YELLOW').length;
    const green = sectors.filter((s) => s.status === 'GREEN').length;

    res.json({
      success: true,
      data: {
        totalPilgrims: total,
        criticalSectors: critical,
        redSectors: red,
        yellowSectors: yellow,
        greenSectors: green,
        totalCapacity: sectors.reduce((sum, s) => sum + s.capacity, 0),
        overallDensity: parseFloat(((total / sectors.reduce((sum, s) => sum + s.capacity, 0)) * 100).toFixed(1)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;