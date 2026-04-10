import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { startPolling, stopPolling } from './utils/apiPoller.js';
import { closePool } from './db/index.js';

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 49217;
const WS_PORT = process.env.WEBSOCKET_PORT || 49218;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// API Routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res
    .status(500)
    .json({ success: false, message: 'Internal server error', error: err.message });
});

// Start HTTP Server
const server = createServer(app);
server.listen(PORT, () => {
  console.log(`\n🚀 Backend API Server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`\n📊 API Endpoints:`);
  console.log(`   GET  /api/latest             - Latest sensor data`);
  console.log(`   GET  /api/history            - Historical data`);
  console.log(`   GET  /api/devices            - All registered devices`);
  console.log(`   GET  /api/device/:id/latest  - Latest data for device`);
  console.log(`   GET  /api/device/:id/trend   - Trend analysis`);
  console.log(`   GET  /api/map-data           - Map location data`);
  console.log(`   GET  /api/alerts             - Recent alerts`);
  console.log(`   GET  /api/report             - Daily/weekly reports`);
  console.log(`   GET  /api/stats              - Aggregate statistics`);
});

// WebSocket Server
const wss = new WebSocketServer({ port: WS_PORT });

const clients = new Set();

wss.on('connection', (ws) => {
  console.log('✓ New WebSocket client connected');
  clients.add(ws);

  ws.on('message', (message) => {
    console.log('WebSocket message:', message);
  });

  ws.on('close', () => {
    console.log('✓ WebSocket client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

console.log(`\n🔌 WebSocket Server running on ws://localhost:${WS_PORT}`);

// Broadcast function for API polling
function broadcastToClients(data) {
  const message = JSON.stringify({
    type: 'sensor_update',
    data,
    timestamp: new Date().toISOString(),
  });

  let activeConnections = 0;
  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN = 1
      client.send(message);
      activeConnections++;
    } else {
      clients.delete(client);
    }
  });

  if (activeConnections > 0) {
    console.log(`📡 Broadcasted to ${activeConnections} WebSocket clients`);
  }
}

// Start API polling
startPolling(broadcastToClients);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n📛 SIGTERM received, shutting down gracefully...');
  stopPolling();
  server.close(() => {
    console.log('HTTP server closed');
  });
  wss.close(() => {
    console.log('WebSocket server closed');
  });
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n📛 SIGINT received, shutting down gracefully...');
  stopPolling();
  server.close(() => {
    console.log('HTTP server closed');
  });
  wss.close(() => {
    console.log('WebSocket server closed');
  });
  await closePool();
  process.exit(0);
});

export default app;
