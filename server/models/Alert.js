const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema(
  {
    alertId: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['OVERCROWDING', 'BOTTLENECK', 'EMERGENCY', 'REROUTE', 'WEATHER', 'STAMPEDE_RISK', 'SECTOR_CLOSURE'],
      required: true,
    },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
    sectorId: { type: String, required: true },
    sectorName: { type: String, required: true },
    message: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    resolvedAt: { type: Date },
    resolvedBy: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', AlertSchema);