# Air Quality Monitoring Dashboard

A full-stack real-time IoT Air Quality Monitoring Dashboard built with React, Node.js, PostgreSQL, and WebSockets.

## 🎯 Features

### Core Features Implemented

1. **Health Impact Score (0-100)**
   - Weighted calculation from multiple sensors
   - Labels: GOOD / MODERATE / DANGEROUS
   - Real-time updates

2. **Hyperlocal Heatmap**
   - Leaflet.js interactive map
   - Device location plotting with color coding
   - Real-time sensor data overlays

3. **Smart Alert System**
   - Context-aware alert generation
   - Threshold-based triggers
   - Severity levels (HIGH, MEDIUM, LOW)

4. **Sensor Fusion Smart AQI**
   - Custom weighted AQI combining all sensors
   - Normalized value combination
   - Separate display from standard metrics

5. **Daily Report Generator**
   - Backend cron-like aggregation
   - Average AQI calculation
   - Peak pollution time tracking
   - Best air quality identification

6. **Trend Analysis & Prediction**
   - Linear trend calculation from last 20 readings
   - Increasing/Decreasing/Stable trends
   - Visual chart representation

### Dashboard Components

- **Health Score Card**: Large centered display with color-coded status
- **Sensor Breakdown**: Individual sensor value bars with color gradients
- **Live Map Heatmap**: Interactive map with device locations and zones
- **Trend Graphs**: Line charts for PM2.5, temperature, and other sensors
- **Smart Alerts Panel**: Real-time alert notifications
- **Daily Report**: Summary statistics and peak pollution times
- **Statistics Cards**: Overview metrics (devices, averages, etc.)

## 🔧 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Leaflet.js** - Interactive maps
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **WebSocket** - Real-time communication
- **Axios** - HTTP client
- **CORS** - Cross-origin support

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- PostgreSQL

### Setup

1. **Backend Setup**
```bash
cd backend
npm install
npm run setup-db
npm start
```

Backend runs on: `http://localhost:49217`
WebSocket on: `ws://localhost:49218`

2. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:51783`

3. **Add API Credentials** (optional)

Edit `backend/.env`:
```
API_KEY=your_api_key
API_URL=your_api_endpoint
```

## 📡 Data Flow

```
External API / Mock Data
    ↓
Backend Polling (5 sec interval)
    ↓
PostgreSQL Storage
    ↓
Calculation Engine (Health Score, AQI, Alerts)
    ↓
REST API + WebSocket Broadcast
    ↓
React Frontend Dashboard
```

## 🧪 Testing the System

### Check Health
```bash
curl http://localhost:49217/health
```

### Fetch Latest Data
```bash
curl http://localhost:49217/api/latest
```

### Get Map Data
```bash
curl http://localhost:49217/api/map-data
```

### View Alerts
```bash
curl http://localhost:49217/api/alerts
```

## 📊 Database Schema

- **sensor_data** - Raw IoT readings
- **health_scores** - Computed health impact scores
- **smart_aqi** - Sensor fusion AQI values
- **alerts** - Generated alert messages
- **daily_reports** - Daily aggregated statistics

## 🔌 Ports Configuration

- **Frontend**: 51783
- **Backend API**: 49217
- **WebSocket**: 49218

All ports are uncommon to avoid conflicts.

## ✨ Key Algorithms

### Health Impact Score Formula
```
Score = (PM2.5 × 40%) + (CO × 20%) + (CO2 × 10%) + (Smoke × 20%) + (Temp/Humidity × 10%)
```

### Smart AQI Calculation
```
Combines normalized sensor values into single 0-100 index
```

### Trend Detection
```
Linear regression on last 20 readings
Calculates slope to detect increasing/decreasing trends
```

## 📝 Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=air_quality_db

# Server
BACKEND_PORT=49217
WEBSOCKET_PORT=49218

# API (optional)
API_KEY=YOUR_KEY
API_URL=YOUR_ENDPOINT
API_POLL_INTERVAL=5000

# Environment
NODE_ENV=development
```

## 🎨 UI Features

- Responsive dark-themed dashboard
- Real-time color-coded status indicators
- Interactive maps with location overlays
- Animated charts and graphs
- Live alert notifications
- Connection status display
- Refresh controls

## 🚀 Production Ready

- Graceful shutdown handling
- Database connection pooling
- Error handling and logging
- CORS configuration
- WebSocket reconnection logic
- Mock data fallback

## 📖 Full Documentation

See [SETUP.md](./SETUP.md) for detailed setup instructions, troubleshooting, and API endpoint documentation.

## 📄 License

MIT

---

**Status**: ✅ Fully Functional | **Last Updated**: April 2024
