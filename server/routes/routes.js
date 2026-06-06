const express = require('express');
const router = express.Router();
const Sector = require('../models/Sector');

function buildGraph(sectors) {
  const graph = {};
  sectors.forEach((sector) => {
    graph[sector.sectorId] = {
      name: sector.name,
      status: sector.status,
      isClosed: sector.isClosed,
      density: sector.density,
      neighbors: sector.adjacentSectors || [],
    };
  });
  return graph;
}

function calculateEdgeCost(fromNode, toNode, graph) {
  const to = graph[toNode];
  if (!to) return Infinity;
  if (to.isClosed || to.status === 'CLOSED') return Infinity;
  const densityCost = to.density / 10;
  const statusPenalty = { GREEN: 0, YELLOW: 2, RED: 8, CRITICAL: 20 }[to.status] || 15;
  return 1 + densityCost + statusPenalty;
}

function dijkstra(graph, startId, endId) {
  const distances = {};
  const previous = {};
  const unvisited = new Set();

  Object.keys(graph).forEach((id) => {
    distances[id] = Infinity;
    previous[id] = null;
    unvisited.add(id);
  });
  distances[startId] = 0;

  while (unvisited.size > 0) {
    let current = null;
    let minDist = Infinity;
    unvisited.forEach((id) => {
      if (distances[id] < minDist) {
        minDist = distances[id];
        current = id;
      }
    });

    if (current === null || current === endId) break;
    unvisited.delete(current);

    const node = graph[current];
    if (!node) continue;

    node.neighbors.forEach((neighborId) => {
      if (!unvisited.has(neighborId)) return;
      const cost = calculateEdgeCost(current, neighborId, graph);
      const newDist = distances[current] + cost;
      if (newDist < distances[neighborId]) {
        distances[neighborId] = newDist;
        previous[neighborId] = current;
      }
    });
  }

  if (distances[endId] === Infinity) return null;

  const path = [];
  let current = endId;
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }
  return { path, cost: distances[endId] };
}

router.post('/optimize', async (req, res) => {
  try {
    const { fromSectorId, toSectorId } = req.body;
    if (!fromSectorId || !toSectorId) {
      return res.status(400).json({ success: false, error: 'fromSectorId and toSectorId are required' });
    }

    const sectors = await Sector.find();
    const graph = buildGraph(sectors);

    if (!graph[fromSectorId] || !graph[toSectorId]) {
      return res.status(404).json({ success: false, error: 'One or both sectors not found' });
    }

    const result = dijkstra(graph, fromSectorId, toSectorId);

    if (!result) {
      return res.json({
        success: false,
        message: 'No safe route available. All paths are blocked or critically congested.',
        alternativeAction: 'Hold pilgrims at origin point. Request emergency corridor opening.',
      });
    }

    const pathDetails = result.path.map((sectorId) => {
      const s = sectors.find((sec) => sec.sectorId === sectorId);
      return {
        sectorId,
        name: s ? s.name : sectorId,
        status: s ? s.status : 'UNKNOWN',
        density: s ? s.density : 0,
        warning: s && s.density > 60 ? `Elevated density: ${s.density}%` : null,
      };
    });

    const avgDensity = pathDetails.reduce((sum, p) => sum + p.density, 0) / pathDetails.length;
    const safetyRating = avgDensity < 40 ? 'SAFE' : avgDensity < 65 ? 'MODERATE' : 'RISKY';

    const altResult = findAlternativeRoute(graph, fromSectorId, toSectorId, result.path);

    res.json({
      success: true,
      data: {
        primaryRoute: {
          path: pathDetails,
          totalCost: result.cost.toFixed(2),
          estimatedTime: `${Math.round(result.path.length * 8 + avgDensity * 0.5)} minutes`,
          safetyRating,
          averageDensity: parseFloat(avgDensity.toFixed(1)),
        },
        alternativeRoute: altResult,
        recommendation:
          safetyRating === 'RISKY'
            ? 'Use this route with police escort only. Consider delaying movement.'
            : safetyRating === 'MODERATE'
            ? 'Proceed with caution. Monitor density at yellow zones.'
            : 'Route is clear. Proceed normally.',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function findAlternativeRoute(graph, start, end, primaryPath) {
  const blockedGraph = JSON.parse(JSON.stringify(graph));
  primaryPath.slice(1, -1).forEach((sectorId) => {
    if (blockedGraph[sectorId]) {
      blockedGraph[sectorId].density = Math.min(100, (blockedGraph[sectorId].density || 0) + 40);
    }
  });

  const altResult = dijkstra(blockedGraph, start, end);
  if (!altResult) return null;

  const avgDensity = altResult.path.reduce((sum, sid) => {
    const node = graph[sid];
    return sum + (node ? node.density : 0);
  }, 0) / altResult.path.length;

  return {
    path: altResult.path.map((sectorId) => ({
      sectorId,
      name: graph[sectorId] ? graph[sectorId].name : sectorId,
      status: graph[sectorId] ? graph[sectorId].status : 'UNKNOWN',
      density: graph[sectorId] ? graph[sectorId].density : 0,
    })),
    totalCost: altResult.cost.toFixed(2),
    estimatedTime: `${Math.round(altResult.path.length * 10 + avgDensity * 0.5)} minutes`,
    safetyRating: avgDensity < 40 ? 'SAFE' : avgDensity < 65 ? 'MODERATE' : 'RISKY',
  };
}

router.get('/hubs', async (req, res) => {
  try {
    const sectors = await Sector.find({}, 'sectorId name zone status density');
    res.json({ success: true, data: sectors });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;