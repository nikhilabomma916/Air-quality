import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const HeatmapCard = ({ devices = [] }) => {
  const getColorByLevel = (level) => {
    switch (level) {
      case 'GOOD':
        return '#10b981'; // Green
      case 'MODERATE':
        return '#f59e0b'; // Yellow
      case 'DANGEROUS':
        return '#ef4444'; // Red
      default:
        return '#6b7280';
    }
  };

  const getThemeColor = (score) => {
    // More detailed color gradient based on score
    if (score <= 33) return '#10b981'; // Green - GOOD
    if (score <= 66) return '#f59e0b'; // Yellow - MODERATE
    return '#ef4444'; // Red - DANGEROUS
  };

  const getMarkerColor = (level) => {
    switch (level) {
      case 'GOOD':
        return '#10b981';
      case 'MODERATE':
        return '#f59e0b';
      case 'DANGEROUS':
        return '#ef4444';
      default:
        return '#3b82f6';
    }
  };

  const createCustomMarker = (level, score) => {
    const color = getThemeColor(score || 0);
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.4);
          font-size: 14px;
        ">
          ${Math.round(score || 0)}
        </div>
      `,
      iconSize: [32, 32],
      popupAnchor: [0, -15],
    });
  };

  // Create routes between nearby devices with color gradients
  const generateRoutes = () => {
    if (!devices || devices.length < 2) return [];

    const routes = [];
    const maxDistance = 5; // km

    for (let i = 0; i < devices.length; i++) {
      for (let j = i + 1; j < devices.length; j++) {
        const d1 = devices[i];
        const d2 = devices[j];

        if (!d1.latitude || !d1.longitude || !d2.latitude || !d2.longitude) continue;

        // Calculate distance (simplified)
        const dist = Math.sqrt(
          Math.pow(d2.latitude - d1.latitude, 2) + Math.pow(d2.longitude - d1.longitude, 2)
        ) * 111; // Rough km conversion

        if (dist <= maxDistance) {
          // Create a route with color based on average health score
          const avgScore = (d1.health_score + d2.health_score) / 2;
          const routeColor = getThemeColor(avgScore);

          routes.push({
            positions: [[d1.latitude, d1.longitude], [d2.latitude, d2.longitude]],
            color: routeColor,
            avgScore: avgScore,
          });
        }
      }
    }

    return routes;
  };

  // Default center (Hyderabad)
  const defaultCenter = [17.385, 78.486];
  const routes = generateRoutes();

  if (!devices || devices.length === 0) {
    return (
      <div className="rounded-xl shadow-lg p-6 h-96 flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <p style={{ color: '#567C8D' }}>No device data available for map</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="p-4" style={{ borderBottom: '2px solid #C8D9E6' }}>
        <h3 className="text-xl font-bold" style={{ color: '#2F4156' }}>Hyper local air quality map</h3>
        
        {/* Legend */}
        <div className="mt-3 flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
            <span style={{ color: '#2F4156' }}>Safe Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
            <span style={{ color: '#2F4156' }}>Moderate Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
            <span style={{ color: '#2F4156' }}>Danger Zone</span>
          </div>
        </div>
      </div>

      <div className="h-96">
        <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* Render routes (paths between devices) with color gradients */}
          {routes.map((route, idx) => (
            <Polyline
              key={`route-${idx}`}
              positions={route.positions}
              pathOptions={{
                color: route.color,
                weight: 4,
                opacity: 0.7,
                dashArray: '5, 5',
              }}
            />
          ))}

          {/* Device Markers and Coverage Circles */}
          {devices.map((device, idx) => (
            <React.Fragment key={idx}>
              {/* Coverage Circle */}
              <Circle
                center={[device.latitude || 0, device.longitude || 0]}
                radius={800}
                pathOptions={{
                  color: getThemeColor(device.health_score),
                  weight: 2,
                  opacity: 0.25,
                  fill: true,
                  fillOpacity: 0.15,
                  fillColor: getThemeColor(device.health_score),
                }}
              />

              {/* Device Marker */}
              <Marker
                position={[device.latitude || 0, device.longitude || 0]}
                icon={createCustomMarker(device.level, device.health_score)}
              >
                <Popup>
                  <div className="text-sm font-semibold">
                    <p className="font-bold text-gray-800">{device.device_id}</p>
                    <div className="mt-2 space-y-1 text-xs">
                      <p className="text-gray-700">
                        <span className="font-semibold">Score:</span> {Math.round(device.health_score)}/100
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Level:</span>{' '}
                        <span
                          className={`font-bold ${
                            device.level === 'GOOD'
                              ? 'text-green-600'
                              : device.level === 'MODERATE'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}
                        >
                          {device.level}
                        </span>
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">PM2.5:</span> {device.pm25?.toFixed(1)} µg/m³
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Smart AQI:</span> {device.smart_aqi?.toFixed(1)}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Temp:</span> {device.temperature?.toFixed(1)}°C
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default HeatmapCard;
