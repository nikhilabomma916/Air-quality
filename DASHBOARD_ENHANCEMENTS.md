# Air Quality Dashboard - UI Enhancements

## Overview
Enhanced the real-time IoT Air Quality Dashboard with advanced visualizations showing sensor contributions, individual readings, and route-based health mapping similar to Google Maps traffic visualization.

---

## 1. Health Impact Score Card - Enhanced
**File:** `frontend/src/components/HealthScoreCard.jsx`

### New Features:
- **Main Circular Score Display** (0-100): Shows overall health impact score with color-coded circle (green/yellow/red)
- **Sensor Contribution Breakdown**: Shows how each sensor affects the overall health score
  - **PM2.5**: Particulate Matter (40% weighting)
  - **CO**: Carbon Monoxide (20% weighting)
  - **CO₂**: Carbon Dioxide (10% weighting)
  - **Smoke**: Smoke Detection (20% weighting)
  - **Temp/Humidity**: Temperature & Humidity (10% weighting)

### Visualization:
- Each sensor shows a **percentage bar** (0-100%) indicating its current contribution level
- Color gradients match the sensor status (Green ≤33%, Yellow 33-66%, Red >66%)
- Weighted calculation: `contribution = min((sensor_value / sensor_max) * 100, 100)`

### Status Messages:
```
GOOD (Score 0-33):   "✓ Air quality acceptable. Enjoy outdoor activity."
MODERATE (34-66):    "⚠ Air quality is moderate. Limit outdoor activities."
DANGEROUS (67-100):  "✗ Air quality is dangerous. Avoid outdoor activities."
```

### Example Output:
```
Health Impact Score: 41/100 (MODERATE)
├─ PM2.5:          46% ████████░░
├─ CO:             26% █████░░░░░
├─ CO₂:            60% ███████████░
├─ Smoke:          64% ███████████░
└─ Temp/Humidity:  35% ███░░░░░░░
```

---

## 2. Individual Sensor Readings - Grid Layout
**File:** `frontend/src/components/SensorBars.jsx`

### New Features:
- **Grid Display** (1-3 columns responsive): Shows each sensor as an individual card
- **Sensor Icons**: Unique icons for each sensor type (Wind, Flame, Cloud, etc.)
- **Color-Coded Status Badge**: Quick visual indicator
  - **Safe/Good/Comfortable**: Green badge
  - **Moderate/Fair**: Yellow badge
  - **Dangerous/Poor**: Red badge
  - **Hot/Cold/Dry/Humid**: Blue/Orange badge

### Data Per Sensor Card:
```
┌─ PM2.5 Sensor ────────────────────┐
│ 🌪️  PM2.5              [Safe]      │
│                                    │
│          115.3 µg/m³               │
│                                    │
│ ████████████████░░░░░░░░           │
│ 23% of max     Max: 500 µg/m³      │
└────────────────────────────────────┘
```

### Readings Included:
- **PM2.5** (0-500 µg/m³): Particulate matter, key respiratory hazard
- **CO** (0-100 ppm): Carbon monoxide, toxic gas detector
- **CO₂** (0-2000 ppm): Carbon dioxide, air freshness indicator
- **Smoke** (0-300 µg/m³): Smoke detection
- **Temperature** (-∞ to 50°C): Comfort indicator
- **Humidity** (0-100%): Moisture level indicator

### Quality Filters:
- **PM2.5 Classification**: Very Good, Good, Moderate, Poor, Very Poor
- **Climate Comfort**: Optimal (15-30°C, 30-60% humidity) vs Suboptimal

---

## 3. Hyperlocal Heatmap with Routes - Google Maps Style
**File:** `frontend/src/components/HeatmapCard.jsx`

### New Features:
- **Zone-Based Coloring** (Like Google Maps Traffic):
  - 🟢 **Green**: Safe Zone (Health Score 0-33)
  - 🟡 **Yellow**: Moderate Zone (Health Score 34-66)
  - 🔴 **Red**: Danger Zone (Health Score 67-100)

- **Route Visualization**: Dashed colored lines connecting nearby devices
  - Routes show air quality progression between sensor locations
  - Line color reflects average health score of connected devices
  - Automatically connects devices within 5 km radius

- **Enhanced Device Markers**:
  - Score displayed inside marker circle (0-100)
  - Color matches health zone classification
  - 800m coverage radius shown as semi-transparent circle

- **Detailed Popups**: Click markers to see:
  - Device ID
  - Health Score
  - Level (GOOD/MODERATE/DANGEROUS)
  - PM2.5 reading
  - Smart AQI
  - Temperature reading

### Map Features:
```
OpenStreetMap base layer
├─ Routes (dashed colored lines)
│  └─ Color based on average health score
├─ Device Markers (numbered circles)
│  └─ Shows health score 0-100
├─ Coverage Zones (semi-transparent circles)
│  └─ 800m radius per device
└─ Legend
   ├─ 🟢 Safe Zone
   ├─ 🟡 Moderate Zone
   └─ 🔴 Danger Zone
```

---

## 4. Backend Integration
**No changes required** - The backend already provides:

### Required Data Fields:
```json
{
  "device_id": "node_5",
  "pm25": 115.28,
  "co": 12.82,
  "co2": 604.60,
  "smoke": 45.0,
  "temperature": 28.5,
  "humidity": 65.0,
  "latitude": 17.385,
  "longitude": 78.486,
  "health_score": 41.01,
  "level": "MODERATE",
  "smart_aqi": 25.31,
  "timestamp": "2026-04-09T16:58:04"
}
```

---

## 5. Color Coding System

### Sensor Contribution Bars (HealthScoreCard):
- **Green**: 0-33% (Safe)
- **Yellow**: 34-66% (Moderate)
- **Red**: 67-100% (Dangerous)

### Status Badges (SensorBars):
| Status | Color | Sensor Examples |
|--------|-------|-----------------|
| Safe | Green | PM2.5 ≤50, CO ≤5 |
| Moderate | Yellow | PM2.5 ≤100, CO ≤10 |
| Dangerous | Red | PM2.5 >100, CO >10 |
| Comfortable | Blue | 15-30°C, 30-60% humidity |
| Too Hot/Humid | Orange | >30°C or >60% humidity |
| Too Cold/Dry | Cyan | <15°C or <30% humidity |

### Map Zones (HeatmapCard):
| Zone | Color | Score Range | Recommendation |
|------|-------|-------------|-----------------|
| Safe | #10b981 Green | 0-33 | Enjoy outdoor activities |
| Moderate | #f59e0b Yellow | 34-66 | Limit outdoor activities |
| Danger | #ef4444 Red | 67-100 | Avoid outdoor activities |

---

## 6. Usage Instructions

### View Dashboard:
```bash
# Frontend automatically loads latest data via WebSocket
# Navigate to: http://127.0.0.1:51783/
```

### To See All Features:
1. **Health Score Card**: Main display (center of dashboard)
   - Shows overall health impact with sensor contribution breakdown
   
2. **Sensor Readings**: Left column or below health card
   - Individual sensor cards with icons, values, and status badges
   
3. **Hyperlocal Heatmap**: Center/right column
   - Interactive map with colored zones and routes
   - Shows device locations with health scores
   - Routes indicate air quality between locations

### Real-Time Updates:
- WebSocket auto-updates every 5 seconds from backend
- Manual refresh button available (top-right)
- Last update timestamp shown in header

---

## 7. Technical Stack

### Frontend Dependencies:
- **React 18.2.0**: UI framework
- **Vite 4.5.14**: Build tool
- **Tailwind CSS 3.3.0**: Styling
- **Leaflet 1.9.4**: Interactive maps
- **React-Leaflet 4+**: React component wrapper for Leaflet
- **Lucide React**: Icon set (Wind, Flame, Cloud, Activity, etc.)
- **Recharts 2.7.2**: Charts (if used)

### Backend Services:
- **Node.js + Express**: REST API on port 49217
- **WebSocket (ws)**: Real-time updates on port 49218
- **PostgreSQL 15**: Data persistence
- **AirVisual API**: Real sensor data (5-sec polling)

---

## 8. Sample Output

### HealthScoreCard Display:
```
┌────────────────────────────────────┐
│    Health Impact Score             │
│                                    │
│          ╭─────────────╮           │
│          │     41      │           │
│          │    /100     │           │
│          ╰─────────────╯           │
│                                    │
│         MODERATE                   │
│ ⚠ Air quality is moderate.         │
│   Limit outdoor activities.        │
│                                    │
│  Sensor Contributions:             │
│  PM2.5      46% ████████░░         │
│  CO         26% █████░░░░░         │
│  CO₂        60% ███████████░       │
│  Smoke      64% ███████████░       │
│  Temp/Hum   35% ███░░░░░░░         │
└────────────────────────────────────┘
```

### SensorBars Display:
```
Individual Sensor Readings

┌─────────────┬─────────────┬─────────────┐
│ 🌪️ PM2.5    │ 🔥 CO       │ ☁️ CO₂      │
│ [Moderate]  │ [Safe]      │ [Fair]      │
│             │             │             │
│ 115.3 µg/m³ │ 12.8 ppm    │ 604.6 ppm   │
│             │             │             │
│ ████████░░░ │ █░░░░░░░░░░ │ ███░░░░░░░░ │
│ 23% of max  │ 13% of max  │ 30% of max  │
└─────────────┴─────────────┴─────────────┘
```

### HeatmapCard Display:
```
Hyperlocal Heatmap with Routes

[OpenStreetMap with:]
- 🟢 Green device markers (safe zones)
- 🟡 Yellow device markers (moderate zones)
- 🔴 Red device markers (danger zones)
- Dashed colored route lines between devices
- Semi-transparent coverage circles (800m each)

Legend: 🟢 Safe Zone  🟡 Moderate Zone  🔴 Danger Zone
```

---

## 9. Future Enhancements

- [ ] Animated trend lines on map showing pollution progression
- [ ] Historical heatmap data visualization
- [ ] Custom alert thresholds per sensor
- [ ] Export data to CSV/PDF
- [ ] Mobile-responsive optimization
- [ ] Dark mode toggle
- [ ] Pollution source detection
- [ ] Weather integration
- [ ] AQI historical comparison

---

## 10. Testing Checklist

- [x] Backend API returns all required sensor fields
- [x] Frontend connects via WebSocket
- [x] HealthScoreCard displays sensor contributions
- [x] SensorBars show individual readings with icons
- [x] HeatmapCard routes appear between devices
- [x] Colors update correctly based on health scores
- [x] Responsive grid layout works on different screen sizes
- [x] Real-time updates via WebSocket triggers UI refresh
- [x] API data persists in PostgreSQL

---

## Last Updated
April 9, 2026 - Complete dashboard redesign with enhanced visualizations

