const mongoose = require('mongoose');

const SectorSchema = new mongoose.Schema(
  {
    sectorId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    zone: { type: String, enum: ['SANGAM', 'GHAT', 'TRANSIT', 'TEMPLE', 'CAMP', 'COMMERCIAL'], required: true },
    capacity: { type: Number, required: true },
    currentOccupancy: { type: Number, default: 0 },
    density: { type: Number, default: 0 },
    status: { type: String, enum: ['GREEN', 'YELLOW', 'RED', 'CLOSED', 'CRITICAL'], default: 'GREEN' },
    coordinates: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      lat: { type: Number },
      lng: { type: Number },
    },
    adjacentSectors: [{ type: String }],
    inflow: { type: Number, default: 0 },
    outflow: { type: Number, default: 0 },
    isClosed: { type: Boolean, default: false },
    resourcesDeployed: {
      police: { type: Number, default: 0 },
      medics: { type: Number, default: 0 },
      volunteers: { type: Number, default: 0 },
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

SectorSchema.virtual('occupancyRate').get(function () {
  return this.capacity > 0 ? (this.currentOccupancy / this.capacity) * 100 : 0;
});

module.exports = mongoose.model('Sector', SectorSchema);