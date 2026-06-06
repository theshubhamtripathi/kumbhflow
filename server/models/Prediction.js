const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema(
  {
    predictionId: { type: String, required: true, unique: true },
    sectorId: { type: String, required: true },
    sectorName: { type: String, required: true },
    predictedOccupancy: { type: Number, required: true },
    predictedStatus: { type: String, enum: ['GREEN', 'YELLOW', 'RED', 'CRITICAL'] },
    confidence: { type: Number, min: 0, max: 100 },
    timeHorizon: { type: Number, required: true },
    forecastTime: { type: Date, required: true },
    factors: {
      shahiSnan: { type: Boolean, default: false },
      timeOfDay: { type: String },
      historicalPeak: { type: Number },
      weatherFactor: { type: Number, default: 1.0 },
      eventFactor: { type: Number, default: 1.0 },
    },
    hourlyForecast: [
      {
        hour: Number,
        occupancy: Number,
        status: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prediction', PredictionSchema);