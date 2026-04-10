# Air Quality Monitoring Dashboard - Setup Guide

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16+ (https://nodejs.org/)
- **PostgreSQL** installed and running (https://www.postgresql.org/)
- macOS/Linux/Windows with terminal access

---

## 🔧 Backend Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Configure PostgreSQL

Make sure PostgreSQL is running:

```bash
# macOS with Homebrew
brew services start postgresql

# Or using Docker
docker run -d -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:latest
```

### 3. Configure Environment Variables

Edit `backend/.env`:

```env
# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=air_quality_db

# Backend Server
BACKEND_PORT=49217
WEBSOCKET_PORT=49218

# API Configuration (OPTIONAL - add your API later)
API_KEY=YOUR_API_KEY_HERE
API_URL=YOUR_API_ENDPOINT_HERE
API_POLL_INTERVAL=5000

NODE_ENV=development
```

### 4. Setup Database

```bash
npm run setup-db
```

**Expected Output:**
```
✓ Connected to PostgreSQL
✓ Created database: air_quality_db
✓ Connected to air_quality_db
✓ Schema created successfully
✓ Database setup completed successfully
```

### 5. Start Backend Server

```bash
npm start
```

**Expected Output:**
```
🚀 Backend API Server running on http://localhost:49217
📝 Health check: http://localhost:49217/health
🔌 WebSocket Server running on ws://localhost:49218
🔄 Starting API polling every 5000ms...
```

---

## 🎨 Frontend Setup

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
VITE v4.x.x ready in xxx ms

➜  Local:   http://localhost:51783/
```

---

## ✅ Verify Everything Works

### 1. Check Backend Health
Visit: http://localhost:49217/health

Expected response:
```json
{
  "status": "ok",
  "message": "Backend is running"
}
```

### 2. Check API Endpoints
Visit: http://localhost:49217/api/latest

Expected response:
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

### 3. Access Dashboard
Visit: http://localhost:51783/

You should see the complete Air Quality Dashboard with:
- ✓ Health Impact Score Card
- ✓ Sensor value bars
- ✓ Interactive map with device locations
- ✓ Trend analysis charts
- ✓ Smart alerts panel
- ✓ Daily report section

---

## 🔌 Using Your Own API

When you have API credentials:

1. Update `backend/.env`:
```env
API_KEY=your_actual_api_key
API_URL=https://your-api-endpoint.com/data
```

2. Restart the backend:
```bash
npm start
```

The backend will now fetch real sensor data instead of using mock data.

---

## 📱 API Endpoints

### Latest Sensor Data
```
GET http://localhost:49217/api/latest
```

### Device Locations (for map)
```
GET http://localhost:49217/api/map-data
```

### Historical Data
```
GET http://localhost:49217/api/history?device_id=node_1&limit=100
```

### Device-Specific Latest
```
GET http://localhost:49217/api/device/node_1/latest
```

### Trend Analysis
```
GET http://localhost:49217/api/device/node_1/trend?field=pm25&limit=20
```

### Recent Alerts
```
GET http://localhost:49217/api/alerts?limit=20
```

### Reports
```
GET http://localhost:49217/api/report?period=daily
```

### Statistics
```
GET http://localhost:49217/api/stats
```

---

## 🔌 WebSocket Connection

The frontend automatically connects to:
```
ws://localhost:49218
```

Real-time sensor updates are broadcast with format:
```json
{
  "type": "sensor_update",
  "data": {
    "device_id": "node_1",
    "pm25": 120,
    "temperature": 32,
    "health_score": 65,
    "level": "MODERATE",
    ...
  },
  "timestamp": "2024-04-09T10:30:00.000Z"
}
```

---

## 🧪 Testing

### Test with cURL

```bash
# Get latest data
curl http://localhost:49217/api/latest

# Get map data
curl http://localhost:49217/api/map-data

# Get alerts
curl http://localhost:49217/api/alerts

# Get stats
curl http://localhost:49217/api/stats
```

---

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# macOS/Linux: Kill process using port
lsof -ti:49217 | xargs kill -9
```

### PostgreSQL Connection Error
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT version();"

# If not running, start it
brew services start postgresql
```

### Frontend Can't Connect to Backend
- Ensure backend is running on port 49217
- Check CORS settings in backend (should allow all origins in dev)
- Check browser console for errors

### WebSocket Connection Issues
- Ensure WebSocket server is running on port 49218
- Frontend automatically reconnects after 3 seconds
- Check browser console for connection logs

---

## 📊 Database Schema

Tables created:
- `sensor_data` - Raw sensor readings
- `health_scores` - Calculated health impact scores
- `smart_aqi` - Sensor fusion AQI values
- `alerts` - Alert messages
- `daily_reports` - Aggregated daily statistics

All tables have JSONB-ready structure and proper indexing for performance.

---

## 🚀 Production Deployment

For production:

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Use environment variables for API_KEY and API_URL

3. Configure PostgreSQL with proper security

4. Use reverse proxy (nginx) for both frontend and backend

5. Enable HTTPS/WSS for real API and WebSocket

---

## 📝 Notes

- ✅ Mock data is generated when API_KEY is not configured
- ✅ Real API data is used when valid credentials are provided
- ✅ All calculations (Health Score, Smart AQI) run in backend
- ✅ WebSocket provides real-time updates to all connected clients
- ✅ Database persists all historical data
- ✅ Dashboard updates every 10 seconds (configurable)

---

## 🆘 Support

If you encounter issues:

1. Check backend logs for errors
2. Verify PostgreSQL is running
3. Ensure all ports (49217, 49218, 51783) are available
4. Check browser console for frontend errors
5. Review API endpoint responses

---

**Dashboard Ready!** 🎉 Access at http://localhost:51783/
