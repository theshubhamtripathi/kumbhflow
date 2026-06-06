const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const sectorRoutes = require('./routes/sectors');
const alertRoutes = require('./routes/alerts');
const predictionRoutes = require('./routes/predictions');
const routeRoutes = require('./routes/routes');
const analyticsRoutes = require('./routes/analytics');
const { simulateCrowdUpdate } = require('./middleware/simulator');
const { seedDatabase } = require('./middleware/seeder');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/sectors', sectorRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'KumbhFlow API Online', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('request_update', async () => {
    const update = await simulateCrowdUpdate();
    socket.emit('crowd_update', update);
  });

  socket.on('sector_closure', async (data) => {
    io.emit('sector_status_change', { sectorId: data.sectorId, status: 'CLOSED', timestamp: new Date() });
  });

  socket.on('emergency_reroute', async (data) => {
    io.emit('emergency_alert', { message: data.message, sectors: data.sectors, severity: 'CRITICAL', timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

cron.schedule('*/8 * * * * *', async () => {
  try {
    const update = await simulateCrowdUpdate();
    io.emit('crowd_update', update);
  } catch (err) {
    console.error('Simulation error:', err.message);
  }
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kumbhflow';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await seedDatabase();
    server.listen(PORT, () => {
      console.log(`KumbhFlow Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = { io };