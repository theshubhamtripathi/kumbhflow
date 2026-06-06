const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

router.get('/', async (req, res) => {
  try {
    const { active, severity } = req.query;
    const filter = {};
    if (active !== undefined) filter.isActive = active === 'true';
    if (severity) filter.severity = severity;
    const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const alert = new Alert({
      alertId: `ALT-${Date.now()}`,
      ...req.body,
    });
    await alert.save();
    res.status(201).json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:alertId/resolve', async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { alertId: req.params.alertId },
      { isActive: false, resolvedAt: new Date(), resolvedBy: req.body.resolvedBy || 'Admin' },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });
    res.json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:alertId', async (req, res) => {
  try {
    await Alert.findOneAndDelete({ alertId: req.params.alertId });
    res.json({ success: true, message: 'Alert deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;