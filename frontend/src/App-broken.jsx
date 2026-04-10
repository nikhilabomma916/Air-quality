import React, { useEffect, useState } from 'react';
import {
  getSensorLatest,
  getMapData,
  getAlerts,
  getReport,
  getStats,
  connectWebSocket,
} from './services/api';
import HealthScoreCard from './components/HealthScoreCard';
import SensorBars from './components/SensorBars';
import HeatmapCard from './components/HeatmapCard';
import AQIGauge from './components/AQIGauge';
import { TrendChart } from './components/Charts';
import AlertsPanel from './components/AlertsPanel';
import DailyReportCard from './components/DailyReportCard';
import { RefreshCw, Activity } from 'lucide-react';
import './index.css';

export default function App() {
  const [latestData, setLatestData] = useState(null);
  const [mapData, setMapData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total_devices: 0,
    total_readings: 0,
    avg_pm25: 0,
    avg_co: 0,
    avg_co2: 0,
    avg_temperature: 0,
    avg_humidity: 0,
    max_pm25: 0,
    max_temperature: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connected, setConnected] = useState(false);

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [latest, mapDevices, recentAlerts, reportData, statsData] = await Promise.all([
        getSensorLatest(),
        getMapData(),
        getAlerts(10),
        getReport('daily'),
        getStats(),
      ]);

      if (latest && latest.length > 0) {
        setLatestData(latest[0]);
      }

      if (mapDevices && mapDevices.length > 0) {
        setMapData(mapDevices);
      }

      if (recentAlerts) {
        setAlerts(recentAlerts);
      }

      if (reportData) {
        setReports(reportData);
      }

      // Always set stats, even if empty
      if (statsData) {
        setStats(statsData);
      } else {
        // Reset to defaults if unable to fetch
        setStats({
          total_devices: 0,
          total_readings: 0,
          avg_pm25: 0,
          avg_co: 0,
          avg_co2: 0,
          avg_temperature: 0,
          avg_humidity: 0,
          max_pm25: 0,
          max_temperature: 0,
        });
      }

      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Initialize WebSocket and fetch data
  useEffect(() => {
    fetchAllData();

    // Connect to WebSocket for real-time updates
    const handleNewData = (data) => {
      if (data) {
        setLatestData(data);
        setConnected(true);
        setLastUpdate(new Date());
      }
    };

    const handleError = (error) => {
      console.warn('WebSocket error (app will work with polling):', error);
      // Don't crash the app - just note that WebSocket failed
      // The app will still work with the polling interval
    };

    const ws = connectWebSocket(handleNewData, handleError);

    // Refresh data every 2 minutes
    const interval = setInterval(fetchAllData, 120000);

    return () => {
      clearInterval(interval);
      if (ws) {
        try {
          ws.close();
        } catch (e) {
          // Ignore close errors
        }
      }
    };
  }, []);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#F5EFEB' }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 pb-6 border-b-2" style={{ borderColor: '#2F4156' }}>
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3" style={{ color: '#2F4156' }}>
              <Activity className="w-10 h-10" />
              Air Quality Monitor
            </h1>
            <p className="mt-2" style={{ color: '#567C8D' }}>Real-time IoT Sensor Dashboard</p>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-2">
              <div
                className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
              ></div>
              <span className={`text-sm font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
                {connected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
            {lastUpdate && (
              <p className="text-sm" style={{ color: '#567C8D' }}>
                Last update: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
            <button
              onClick={fetchAllData}
              className="mt-2 text-white px-4 py-2 rounded-lg flex items-center gap-2 ml-auto font-medium hover:opacity-90 transition"
              style={{ backgroundColor: '#567C8D' }}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg p-4" style={{ backgroundColor: '#C8D9E6' }}>
            <p className="text-sm font-medium" style={{ color: '#2F4156' }}>Total Devices</p>
            <p className="text-3xl font-bold mt-2" style={{ color: '#2F4156' }}>{stats?.total_devices || 0}</p>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: '#C8D9E6' }}>
            <p className="text-sm font-medium" style={{ color: '#2F4156' }}>Avg PM2.5</p>
            <p className="text-3xl font-bold mt-2" style={{ color: '#2F4156' }}>
              {typeof stats?.avg_pm25 === 'number' && stats.avg_pm25 >= 0 ? stats.avg_pm25.toFixed(1) : '--'} µg/m³
            </p>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: '#C8D9E6' }}>
            <p className="text-sm font-medium" style={{ color: '#2F4156' }}>Avg Temperature</p>
            <p className="text-3xl font-bold mt-2" style={{ color: '#2F4156' }}>
              {typeof stats?.avg_temperature === 'number' && stats.avg_temperature >= 0 ? stats.avg_temperature.toFixed(1) : '--'}°C
            </p>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: '#C8D9E6' }}>
            <p className="text-sm font-medium" style={{ color: '#2F4156' }}>Readings (1h)</p>
            <p className="text-3xl font-bold mt-2" style={{ color: '#2F4156' }}>{stats?.total_readings || 0}</p>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#567C8D' }} />
              <p style={{ color: '#2F4156' }} className="font-medium">Loading dashboard...</p>
            </div>
          </div>
        ) : !latestData ? (
          <div className="flex items-center justify-center py-20">
            <div className="rounded-lg p-8 text-center max-w-md" style={{ backgroundColor: '#FFFFFF', borderLeft: '4px solid #567C8D' }}>
              <Activity className="w-12 h-12 mx-auto mb-4" style={{ color: '#567C8D' }} />
              <h2 className="text-xl font-bold mb-2" style={{ color: '#2F4156' }}>Waiting for Live Data</h2>
              <p className="mb-4" style={{ color: '#567C8D' }}>
                No sensor data available yet. Please configure your API credentials:
              </p>
              <div className="rounded p-4 text-left text-sm mb-4 font-mono" style={{ backgroundColor: '#C8D9E6', color: '#2F4156' }}>
                <p className="mb-2">backend/.env</p>
                <p style={{ color: '#567C8D' }}>API_KEY=your_api_key</p>
                <p style={{ color: '#567C8D' }}>API_URL=your_api_endpoint</p>
              </div>
              <p className="text-sm" style={{ color: '#567C8D' }}>
                Then restart the backend to begin receiving sensor data.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Top Section - Quick Stats Compact Row */}
            <div className="bg-gradient-to-r rounded-2xl p-6 mb-8 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="grid grid-cols-5 gap-4">
                {/* Health Score - Compact Widget */}
                {latestData && (
                  <div className="rounded-xl shadow-md p-5" style={{ backgroundColor: '#F5EFEB', borderTop: '4px solid #567C8D' }}>
                    <h4 className="text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: '#2F4156' }}>Health</h4>
                    <div className="flex items-center justify-center mb-2">
                      <div className="relative w-14 h-14">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#C8D9E6" strokeWidth="5" />
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke={
                              latestData.health_score >= 75
                                ? '#10b981'
                                : latestData.health_score >= 50
                                ? '#f59e0b'
                                : '#ef4444'
                            }
                            strokeWidth="5"
                            strokeDasharray={`${(latestData.health_score / 100) * 264} 264`}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dasharray 0.5s ease' }}
                          />
                          <text x="50" y="57" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#2F4156">
                            {Math.round(latestData.health_score)}
                          </text>
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-center font-semibold" style={{ color: '#567C8D' }}>
                      {latestData.level || 'GOOD'}
                    </p>
                  </div>
                )}

                {/* PM2.5 Card */}
                <div className="rounded-xl shadow-md p-5" style={{ backgroundColor: '#FFFFFF', borderTop: '4px solid #f59e0b' }}>
                  <p className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#2F4156' }}>PM2.5</p>
                  <p className="text-2xl font-bold" style={{ color: '#2F4156' }}>{latestData?.pm25?.toFixed(1) || '--'}</p>
                  <p className="text-xs mt-1" style={{ color: '#567C8D' }}>µg/m³</p>
                </div>

                {/* CO Card */}
                <div className="rounded-xl shadow-md p-5" style={{ backgroundColor: '#FFFFFF', borderTop: '4px solid #3b82f6' }}>
                  <p className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#2F4156' }}>CO</p>
                  <p className="text-2xl font-bold" style={{ color: '#2F4156' }}>{latestData?.co?.toFixed(1) || '--'}</p>
                  <p className="text-xs mt-1" style={{ color: '#567C8D' }}>ppm</p>
                </div>

                {/* CO2 Card */}
                <div className="rounded-xl shadow-md p-5" style={{ backgroundColor: '#FFFFFF', borderTop: '4px solid #8b5cf6' }}>
                  <p className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#2F4156' }}>CO₂</p>
                  <p className="text-2xl font-bold" style={{ color: '#2F4156' }}>{latestData?.co2?.toFixed(1) || '--'}</p>
                  <p className="text-xs mt-1" style={{ color: '#567C8D' }}>ppm</p>
                </div>

                {/* Temperature Card */}
                <div className="rounded-xl shadow-md p-5" style={{ backgroundColor: '#FFFFFF', borderTop: '4px solid #ec4899' }}>
                  <p className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#2F4156' }}>Temp</p>
                  <p className="text-2xl font-bold" style={{ color: '#2F4156' }}>{latestData?.temperature?.toFixed(1) || '--'}°C</p>
                  <p className="text-xs mt-1" style={{ color: '#567C8D' }}>Celsius</p>
                </div>
              </div>
            </div>

            {/* Main Content - 3 Column Layout */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* Left Column - Sensor Details & AQI Gauge */}
              <div className="space-y-6">
                <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
                  {latestData && <SensorBars sensors={latestData} />}
                </div>
                {latestData && (
                  <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
                    <AQIGauge 
                      aqi={latestData.aqi_value || latestData.health_score || 0}
                      level={latestData.level || 'GOOD'}
                    />
                  </div>
                )}
              </div>

              {/* Center Column - Heatmap (Hero Section) */}
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
                <HeatmapCard devices={mapData} />
              </div>

              {/* Right Column - Alerts & Daily Report */}
              <div className="space-y-6">
                <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
                  <AlertsPanel alerts={alerts} />
                </div>
                <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
                  <DailyReportCard reports={reports} />
                </div>
              </div>
            </div>

            {/* Trend Charts - Bottom Section */}
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
                <TrendChart data={mapData} field="pm25" />
              </div>
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
                <TrendChart data={mapData} field="temperature" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
