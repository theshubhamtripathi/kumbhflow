const express = require('express');
const router = express.Router();
const Sector = require('../models/Sector');

const SHAHI_SNAN_DATES = ['2025-01-13', '2025-01-14', '2025-01-29', '2025-02-03', '2025-02-12', '2025-02-26'];

function isShahiSnan(dateStr) {
  return SHAHI_SNAN_DATES.includes(dateStr);
}

function getPeakMultiplier(hour, isShahi) {
  const base = isShahi ? 1.6 : 1.0;
  if (hour >= 3 && hour <= 6) return base * 2.1;
  if (hour >= 6 && hour <= 9) return base * 1.8;
  if (hour >= 9 && hour <= 12) return base * 1.5;
  if (hour >= 12 && hour <= 15) return base * 1.2;
  if (hour >= 15 && hour <= 18) return base * 1.4;
  if (hour >= 18 && hour <= 21) return base * 1.3;
  return base * 0.7;
}

function getStatusFromDensity(density) {
  if (density >= 90) return 'CRITICAL';
  if (density >= 75) return 'RED';
  if (density >= 50) return 'YELLOW';
  return 'GREEN';
}

router.get('/forecast', async (req, res) => {
  try {
    const { date, hours = 12 } = req.query;
    const forecastDate = date || new Date().toISOString().split('T')[0];
    const isShahi = isShahiSnan(forecastDate);

    const sectors = await Sector.find();
    const forecasts = sectors.map((sector) => {
      const hourlyForecast = [];
      const currentHour = new Date().getHours();

      for (let h = 0; h < parseInt(hours); h++) {
        const forecastHour = (currentHour + h) % 24;
        const multiplier = getPeakMultiplier(forecastHour, isShahi);
        const noise = 0.9 + Math.random() * 0.2;
        const predictedOccupancy = Math.min(sector.capacity, sector.currentOccupancy * multiplier * noise);
        const density = (predictedOccupancy / sector.capacity) * 100;

        hourlyForecast.push({
          hour: forecastHour,
          label: `${String(forecastHour).padStart(2, '0')}:00`,
          occupancy: Math.round(predictedOccupancy),
          density: parseFloat(density.toFixed(1)),
          status: getStatusFromDensity(density),
        });
      }

      const peakHour = hourlyForecast.reduce((max, h) => (h.occupancy > max.occupancy ? h : max));
      const confidence = isShahi ? 87 + Math.random() * 8 : 78 + Math.random() * 12;

      return {
        sectorId: sector.sectorId,
        sectorName: sector.name,
        currentOccupancy: sector.currentOccupancy,
        currentDensity: sector.density,
        currentStatus: sector.status,
        isShahiSnanDay: isShahi,
        confidence: parseFloat(confidence.toFixed(1)),
        peakExpectedAt: `${String(peakHour.hour).padStart(2, '0')}:00`,
        peakOccupancy: peakHour.occupancy,
        peakDensity: peakHour.density,
        peakStatus: peakHour.status,
        hourlyForecast,
        recommendation: peakHour.density >= 85
          ? `URGENT: Pre-position 3 additional response teams at ${sector.name} by ${String((peakHour.hour - 1 + 24) % 24).padStart(2, '0')}:00.`
          : peakHour.density >= 65
          ? `ADVISORY: Monitor ${sector.name} closely. Consider incremental access restrictions.`
          : `NORMAL: ${sector.name} is within safe operating parameters.`,
      };
    });

    const overallRisk = forecasts.filter((f) => f.peakStatus === 'CRITICAL' || f.peakStatus === 'RED').length;

    res.json({
      success: true,
      data: {
        forecastDate,
        isShahiSnanDay: isShahi,
        upcomingShahiSnans: SHAHI_SNAN_DATES,
        overallRiskLevel: overallRisk >= 4 ? 'EXTREME' : overallRisk >= 2 ? 'HIGH' : overallRisk >= 1 ? 'MEDIUM' : 'LOW',
        forecasts,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/shahi-snan-calendar', async (req, res) => {
  res.json({
    success: true,
    data: {
      dates: SHAHI_SNAN_DATES.map((d) => ({
        date: d,
        name: getSnahiSnanName(d),
        expectedPilgrims: getSnahiExpected(d),
        riskLevel: 'EXTREME',
      })),
    },
  });
});

function getSnahiSnanName(date) {
  const names = {
    '2025-01-13': 'Makar Sankranti Snan',
    '2025-01-14': 'Makar Sankranti (Main)',
    '2025-01-29': 'Mauni Amavasya (Peak)',
    '2025-02-03': 'Basant Panchami Snan',
    '2025-02-12': 'Maghi Purnima Snan',
    '2025-02-26': 'Mahashivratri Snan',
  };
  return names[date] || 'Shahi Snan';
}

function getSnahiExpected(date) {
  const expected = {
    '2025-01-13': 3500000,
    '2025-01-14': 5000000,
    '2025-01-29': 10000000,
    '2025-02-03': 4000000,
    '2025-02-12': 3000000,
    '2025-02-26': 2500000,
  };
  return expected[date] || 2000000;
}

module.exports = router;