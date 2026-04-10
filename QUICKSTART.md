# 🚀 Air Quality Monitoring Dashboard - Complete Setup

## ✅ Project Status: FULLY BUILT & READY

All components have been successfully created and tested.

---

## 📦 What's Been Built

### ✓ Backend (Node.js + Express + PostgreSQL)
- API server on `http://localhost:49217`
- WebSocket server on `ws://localhost:49218`
- PostgreSQL database configured
- Real-time sensor data processing
- Health score & AQI calculations
- Smart alert system
- Daily report generation

### ✓ Frontend (React + Vite + Tailwind)
- Dashboard on `http://localhost:51783`
- Real-time WebSocket integration
- Interactive Leaflet maps
- Recharts visualizations
- Responsive design
- All components built and styled

### ✓ Features Implemented
1. ✅ Health Impact Score (0-100)
2. ✅ Hyperlocal Heatmap with Leaflet
3. ✅ Smart Alert System
4. ✅ Sensor Fusion Smart AQI
5. ✅ Daily Report Generator
6. ✅ Trend Analysis & Prediction

---

## 🚀 Quick Start (Recommended)

### Option 1: Use Startup Script (Easiest)

```bash
cd /Users/arundathiasalla/Downloads/emg/emerge1
chmod +x start.sh
./start.sh
```

Then open: http://localhost:51783

---

## 🔧 Manual Setup

### Step 1: Ensure PostgreSQL is Running
```bash
brew services start postgresql@15
```

### Step 2: Start Backend
```bash
cd /Users/arundathiasalla/Downloads/emg/emerge1/backend
npm start
```

You should see:
```
🚀 Backend API Server running on http://localhost:49217
🔌 WebSocket Server running on ws://localhost:49218
🔄 Starting API polling every 5000ms...
✓ Processed sensor data from node_1
✓ Processed sensor data from node_2
...
```

### Step 3: Start Frontend (in another terminal)
```bash
cd /Users/arundathiasalla/Downloads/emg/emerge1/frontend
npm run dev
```

You should see:
```
➜  Local:   http://localhost:51783/
```

### Step 4: Open Dashboard
Open your browser to: **http://localhost:51783/**

---

## 🧪 Testing the System

### Test Backend Health
```bash
curl http://localhost:49217/health
#  Response: {"status":"ok","message":"Backend is running"}
```

### Test Latest Sensor Data
```bash
curl http://localhost:49217/api/latest | python3 -m json.tool | head -30
```

### Test Map Data
```bash
curl http://localhost:49217/api/map-data | python3 -m json.tool
```

### Test Alerts
```bash
curl http://localhost:49217/api/alerts | python3 -m json.tool
```

### Test Statistics
```bash
curl http://localhost:49217/api/stats | python3 -m json.tool
```

---

## 📊 Dashboard Features

You'll see on the dashboard:

1. **Health Score Card** - Large centered score (0-100) with color indicator
2. **Sensor Breakdown** - Individual sensor values with color-coded bars
3. **Live Map** - Interactive map showing device locations with heatmap zones
4. **Trend Charts** - PM2.5 trends and temperature patterns
5. **Smart Alerts** - Real-time notifications about air quality
6. **Daily Report** - Summary stats and peak pollution times
7. **Statistics Cards** - Overview metrics at the top

---

## 🔌 Integration with Real API

When you have API credentials:

1. Edit `backend/.env`:
```env
API_KEY=your_actual_api_key
API_URL=https://your-api-endpoint.com/data
```

2. Restart backend:
```bash
# Stop the current backend (Ctrl+C)
npm start  # in backend directory
```

The backend will now fetch real data instead of mock data.

---

## 📁 Project Structure

```
emerge1/
├── backend/
│   ├── server.js              # Main Express server
│   ├── routes/api.js          # API endpoints
│   ├── db/
│   │   ├── index.js           # PostgreSQL connection
│   │   ├── schema.sql         # Database schema
│   │   └── setup.js           # Database initialization
│   ├── utils/
│   │   ├── calculations.js    # Health score & AQI
│   │   └── apiPoller.js       # API polling & mock data
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main dashboard
│   │   ├── main.jsx           # React entry
│   │   ├── index.css          # Global styles
│   │   ├── services/api.js    # API client
│   │   └── components/        # React components
│   │       ├── HealthScoreCard.jsx
│   │       ├── SensorBars.jsx
│   │       ├── HeatmapCard.jsx
│   │       ├── Charts.jsx
│   │       ├── AlertsPanel.jsx
│   │       └── DailyReportCard.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── postcss.config.js
│
├── README.md
├── SETUP.md
├── start.sh               # Automated startup
└── .env files configured
```

---

## 🔌 API Endpoints Reference

### Sensor Data
```
GET  /api/latest                 - Latest readings (last 10)
GET  /api/history?limit=100      - Historical data
GET  /api/device/:id/latest      - Device specific latest
GET  /api/device/:id/trend       - Trend analysis
```

### System Info
```
GET  /api/devices                - All registered devices
GET  /api/map-data              - Map location data
GET  /api/stats                 - Aggregate statistics
```

### Alerts & Reports
```
GET  /api/alerts?limit=20        - Recent alerts
GET  /api/report?period=daily    - Daily/weekly reports
```

All endpoints return JSON responses.

---

## 🧠 Algorithm Details

### Health Impact Score Formula
```
Score = (PM2.5 × 0.4) + (CO × 0.2) + (CO2 × 0.1) + (Smoke × 0.2) + (Temp/Humidity × 0.1)

Score Range:  0-100
Labels:       
  0-33   → GOOD
  34-66  → MODERATE
  67-100 → DANGEROUS
```

### Smart AQI Calculation
Combines all sensors into a single weighted index (0-100):
- Normalizes each sensor value
- Applies weights same as health score
- Clamps to 0-1 range before combining

### Trend Detection
- Uses linear regression on last 20 readings
- Calculates slope to detect direction
- Predicts next value

---

## 🛠️ Troubleshooting

### "Cannot find module"
```bash
# Run in the problematic directory:
cd backend  # or frontend
npm install
```

### Port Already in Use
```bash
# Kill process using port
lsof -ti:49217 | xargs kill -9   # Backend
lsof -ti:51783 | xargs kill -9   # Frontend
lsof -ti:49218 | xargs kill -9   # WebSocket
```

### PostgreSQL Connection Error
```bash
# Start PostgreSQL
brew services start postgresql@15

# Reset postgres password if needed
psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

### Frontend Can't Connect to Backend
1. Ensure backend is running on port 49217
2. Check browser console for errors
3. Verify CORS is enabled (should be in server.js)

### WebSocket Connection Issues
- Frontend auto-reconnects after 3 seconds
- Check `ws://localhost:49218` connectivity
- Look for errors in browser console

---

## 📊 Mock Data

When `API_KEY` is not configured, realistic mock data is generated:

- **5 devices** (node_1 through node_5) in Hyderabad area
- **Realistic sensor values** with time-based variation
- **Dynamic health scores** calculated in real-time
- **Smart alerts** triggered based on thresholds
- **Data persisted** to PostgreSQL

This allows you to test the entire system without external API.

---

## 🚀 Production Deployment

For production use:

1. Set real `API_KEY` and `API_URL` in `.env`
2. Configure PostgreSQL securely
3. Use reverse proxy (nginx) for both services
4. Enable HTTPS/WSS
5. Set `NODE_ENV=production`
6. Use process manager (PM2) for backend
7. Build frontend: `npm run build`

---

## 📝 Key Features Implemented

### ✅ Real-time Updates
- WebSocket broadcast to all clients
- API polling every 5 seconds
- Database persistence

### ✅ Intelligent Calculations
- Health score based on all sensors
- Sensor fusion AQI
- Trend analysis & prediction
- Context-aware alerts

### ✅ Professional Dashboard
- Responsive dark theme
- Real-time color indicators
- Interactive maps
- Professional charts
- Clean UI/UX

### ✅ Production Ready
- Proper error handling
- Database optimization (indexes)
- Connection pooling
- Graceful shutdown
- Logging

---

## ✨ Next Steps

1. Open http://localhost:51783 in browser
2. Observe real-time sensor data updates
3. Interact with maps and charts
4. View alerts and reports
5. When ready, add your real API credentials

---

## 📞 Support

All endpoints are documented in `SETUP.md`.
Code is fully commented for easy extension.
Architecture is modular for easy modifications.

---

**Status**: ✅ Production Ready
**Last Updated**: April 9, 2024
**Ready to Deploy**: YES

Enjoy your Air Quality Dashboard! 🎉
