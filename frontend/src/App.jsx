import React, { useEffect, useState } from 'react';
import {
  getSensorLatest,
  getMapData,
  getAlerts,
  getReport,
  getStats,
  connectWebSocket,
} from './services/api';
import SensorBars from './components/SensorBars';
import HeatmapCard from './components/HeatmapCard';
import AQIGauge from './components/AQIGauge';
import { TrendChart } from './components/Charts';
import AlertsPanel from './components/AlertsPanel';
import DailyReportCard from './components/DailyReportCard';
import { RefreshCw, Activity, Wind, Thermometer, Flame, Cloud } from 'lucide-react';
import './index.css';

export default function App() {
  const [latestData, setLatestData] = useState(null);
  const [mapData, setMapData]       = useState([]);
  const [alerts, setAlerts]         = useState([]);
  const [reports, setReports]       = useState([]);
  const [stats, setStats]           = useState({
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
  const [loading, setLoading]       = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connected, setConnected]   = useState(false);

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

      if (latest?.length > 0)    setLatestData(latest[0]);
      if (mapDevices?.length > 0) setMapData(mapDevices);
      if (recentAlerts)           setAlerts(recentAlerts);
      if (reportData)             setReports(reportData);
      if (statsData) {
        setStats(statsData);
      } else {
        setStats({ total_devices: 0, total_readings: 0, avg_pm25: 0, avg_co: 0, avg_co2: 0,
                   avg_temperature: 0, avg_humidity: 0, max_pm25: 0, max_temperature: 0 });
      }
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    const ws = connectWebSocket(
      (data) => { if (data) { setLatestData(data); setConnected(true); setLastUpdate(new Date()); } },
      (err)  => { console.warn('WebSocket error (polling fallback):', err); }
    );

    const interval = setInterval(fetchAllData, 120000);
    return () => {
      clearInterval(interval);
      try { ws?.close(); } catch (_) {}
    };
  }, []);

  /* ─── helpers ─── */
  const fmt = (v, decimals = 1) =>
    typeof v === 'number' && v >= 0 ? v.toFixed(decimals) : '--';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5EFEB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── HEADER ── */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 pb-5"
          style={{ borderBottom: '2px solid #C8D9E6' }}
        >
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3" style={{ color: '#2F4156' }}>
              <Activity size={32} />
              Air Quality Monitor
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#567C8D' }}>Real-time IoT Sensor Dashboard</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-500' : 'bg-red-400'}`} />
              <span className={`text-sm font-medium ${connected ? 'text-green-600' : 'text-red-500'}`}>
                {connected ? 'Live' : 'Connecting…'}
              </span>
            </div>
            {lastUpdate && (
              <p className="text-xs" style={{ color: '#567C8D' }}>
                Updated {lastUpdate.toLocaleTimeString()}
              </p>
            )}
            <button
              onClick={fetchAllData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#567C8D' }}
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── SUMMARY STATS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Devices',   value: stats?.total_devices ?? 0,                      suffix: '' },
            { label: 'Avg PM2.5',       value: fmt(stats?.avg_pm25),                            suffix: ' µg/m³' },
            { label: 'Avg Temperature', value: fmt(stats?.avg_temperature),                     suffix: '°C' },
            { label: 'Readings (1 h)',  value: stats?.total_readings ?? 0,                      suffix: '' },
          ].map(({ label, value, suffix }) => (
            <div key={label} className="rounded-xl p-4" style={{ backgroundColor: '#C8D9E6' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#567C8D' }}>
                {label}
              </p>
              <p className="text-2xl font-bold" style={{ color: '#2F4156' }}>
                {value}{suffix}
              </p>
            </div>
          ))}
        </div>

        {/* ── LOADING / EMPTY STATES ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <RefreshCw size={44} className="animate-spin mx-auto mb-4" style={{ color: '#567C8D' }} />
              <p className="font-medium" style={{ color: '#2F4156' }}>Loading dashboard…</p>
            </div>
          </div>
        ) : !latestData ? (
          <div className="flex items-center justify-center py-24">
            <div
              className="rounded-2xl p-8 text-center max-w-md w-full shadow-md"
              style={{ backgroundColor: '#FFFFFF', borderLeft: '4px solid #567C8D' }}
            >
              <Activity size={44} className="mx-auto mb-4" style={{ color: '#567C8D' }} />
              <h2 className="text-xl font-bold mb-2" style={{ color: '#2F4156' }}>
                Waiting for Live Data
              </h2>
              <p className="mb-4 text-sm" style={{ color: '#567C8D' }}>
                No sensor data yet. Configure your API credentials in:
              </p>
              <div
                className="rounded-lg p-4 text-left text-xs font-mono mb-4"
                style={{ backgroundColor: '#EAF2F8', color: '#2F4156' }}
              >
                <p className="mb-1 font-semibold">backend/.env</p>
                <p style={{ color: '#567C8D' }}>API_KEY=your_api_key</p>
                <p style={{ color: '#567C8D' }}>API_URL=your_api_endpoint</p>
              </div>
              <p className="text-xs" style={{ color: '#567C8D' }}>
                Restart the backend to begin receiving data.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── QUICK METRICS ROW ── */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {/* Health score mini-gauge */}
              <div
                className="rounded-xl p-4 flex flex-col items-center gap-2"
                style={{ backgroundColor: '#FFFFFF', borderTop: '4px solid #567C8D' }}
              >
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#2F4156' }}>Health</p>
                <div className="relative w-14 h-14">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#C8D9E6" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke={latestData.health_score >= 75 ? '#10b981' : latestData.health_score >= 50 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="8"
                      strokeDasharray={`${(latestData.health_score / 100) * 264} 264`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 0.5s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    />
                    <text x="50" y="56" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#2F4156">
                      {Math.round(latestData.health_score)}
                    </text>
                  </svg>
                </div>
                <p className="text-xs font-semibold" style={{ color: '#567C8D' }}>
                  {latestData.level || 'GOOD'}
                </p>
              </div>

              {[
                { label: 'PM2.5',  value: fmt(latestData?.pm25),        unit: 'µg/m³', accent: '#f59e0b', Icon: Wind       },
                { label: 'CO',     value: fmt(latestData?.co),           unit: 'ppm',   accent: '#3b82f6', Icon: Flame      },
                { label: 'CO₂',    value: fmt(latestData?.co2),          unit: 'ppm',   accent: '#8b5cf6', Icon: Cloud      },
                { label: 'Temp',   value: fmt(latestData?.temperature),  unit: '°C',    accent: '#ec4899', Icon: Thermometer },
              ].map(({ label, value, unit, accent, Icon }) => (
                <div
                  key={label}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: '#FFFFFF', borderTop: `4px solid ${accent}` }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon size={14} style={{ color: accent }} />
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#2F4156' }}>{label}</p>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: '#2F4156' }}>{value}</p>
                  <p className="text-xs mt-1" style={{ color: '#567C8D' }}>{unit}</p>
                </div>
              ))}
            </div>

            {/* ── MAP + SIDEBAR ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Heatmap – takes 2/3 */}
              <div className="lg:col-span-2">
                <HeatmapCard devices={mapData} />
              </div>

              {/* Sidebar – AQI + Alerts */}
              <div className="flex flex-col gap-6">
                <AQIGauge
                  aqi={latestData.aqi_value || latestData.health_score || 0}
                  level={latestData.level || 'GOOD'}
                />
                <AlertsPanel alerts={alerts} />
              </div>
            </div>

            {/* ── SENSOR READINGS (full width) ── */}
            <SensorBars sensors={latestData} />

            {/* ── CHARTS + DAILY REPORT ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <TrendChart data={mapData} field="pm25" />
                <TrendChart data={mapData} field="temperature" />
              </div>
              <DailyReportCard reports={reports} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
