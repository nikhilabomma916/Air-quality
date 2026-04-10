import React from 'react';
import { Activity, Wind, Droplets, Flame, Thermometer, Cloud } from 'lucide-react';

export const SensorBars = ({ sensors }) => {
  const getSensorColor = (value, sensor) => {
    switch (sensor) {
      case 'pm25':
        return value <= 50 ? 'bg-green-500' : value <= 100 ? 'bg-yellow-500' : 'bg-red-500';
      case 'co':
        return value <= 5 ? 'bg-green-500' : value <= 10 ? 'bg-yellow-500' : 'bg-red-500';
      case 'co2':
        return value <= 500 ? 'bg-green-500' : value <= 1000 ? 'bg-yellow-500' : 'bg-red-500';
      case 'smoke':
        return value <= 50 ? 'bg-green-500' : value <= 150 ? 'bg-yellow-500' : 'bg-red-500';
      case 'temperature':
        return value >= 15 && value <= 30 ? 'bg-blue-500' : value > 30 ? 'bg-red-500' : 'bg-cyan-500';
      case 'humidity':
        return value >= 30 && value <= 60 ? 'bg-blue-500' : 'bg-orange-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusColors = (status) => {
    if (['Safe', 'Good', 'Comfortable'].includes(status))
      return { bg: '#d1fae5', text: '#065f46' };
    if (['Moderate', 'Fair', 'Hot', 'Cold', 'Dry'].includes(status))
      return { bg: '#fef3c7', text: '#92400e' };
    if (['Dangerous', 'Poor'].includes(status))
      return { bg: '#fee2e2', text: '#991b1b' };
    return { bg: '#dbeafe', text: '#1e40af' };
  };

  const getMaxValue = (sensor) => {
    const map = { pm25: 500, co: 100, co2: 2000, smoke: 300, temperature: 50, humidity: 100 };
    return map[sensor] ?? 100;
  };

  const getUnit = (sensor) => {
    const map = { pm25: 'µg/m³', co: 'ppm', co2: 'ppm', smoke: 'µg/m³', temperature: '°C', humidity: '%' };
    return map[sensor] ?? '';
  };

  const getSensorIcon = (sensor) => {
    const props = { size: 18 };
    switch (sensor) {
      case 'pm25':        return <Wind {...props} className="text-red-500" />;
      case 'co':          return <Flame {...props} className="text-orange-500" />;
      case 'co2':         return <Cloud {...props} className="text-slate-500" />;
      case 'smoke':       return <Activity {...props} className="text-slate-600" />;
      case 'temperature': return <Thermometer {...props} className="text-red-400" />;
      case 'humidity':    return <Droplets {...props} className="text-blue-400" />;
      default:            return null;
    }
  };

  const getDisplayName = (key) => {
    const map = { pm25: 'PM2.5', co: 'CO', co2: 'CO₂', smoke: 'Smoke', temperature: 'Temperature', humidity: 'Humidity' };
    return map[key] ?? (key.charAt(0).toUpperCase() + key.slice(1));
  };

  const getSensorStatus = (value, sensor) => {
    switch (sensor) {
      case 'pm25':
        return value <= 50 ? 'Safe' : value <= 100 ? 'Moderate' : 'Dangerous';
      case 'co':
        return value <= 5 ? 'Safe' : value <= 10 ? 'Moderate' : 'Dangerous';
      case 'co2':
        return value <= 500 ? 'Good' : value <= 1000 ? 'Fair' : 'Poor';
      case 'smoke':
        return value <= 50 ? 'Safe' : value <= 150 ? 'Moderate' : 'Dangerous';
      case 'temperature':
        return value >= 15 && value <= 30 ? 'Comfortable' : value > 30 ? 'Hot' : 'Cold';
      case 'humidity':
        return value >= 30 && value <= 60 ? 'Comfortable' : value < 30 ? 'Dry' : 'Humid';
      default:
        return 'Normal';
    }
  };

  const SENSOR_ORDER = ['pm25', 'co', 'co2', 'smoke', 'temperature', 'humidity'];
  const SKIP_KEYS = new Set([
    'id', 'device_id', 'latitude', 'longitude', 'timestamp', 'health_score', 'level', 'smart_aqi'
  ]);

  const sensorEntries = sensors
    ? SENSOR_ORDER
        .filter((k) => sensors[k] !== undefined && sensors[k] !== null && typeof sensors[k] === 'number' && !SKIP_KEYS.has(k))
        .map((k) => [k, sensors[k]])
    : [];

  return (
    <div
      className="rounded-2xl shadow-md p-6"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {/* Section heading */}
      <h3 className="text-xl font-bold mb-6" style={{ color: '#2F4156' }}>
        Individual Sensor Readings
      </h3>

      {/* Sensor cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensorEntries.map(([key, value]) => {
          const maxValue   = getMaxValue(key);
          const percentage = Math.min((value / maxValue) * 100, 100);
          const status     = getSensorStatus(value, key);
          const statusClr  = getStatusColors(status);
          const barColor   = getSensorColor(value, key);
          const unit       = getUnit(key);
          const name       = getDisplayName(key);

          return (
            <div
              key={key}
              className="flex flex-col rounded-xl p-4 gap-3"
              style={{ backgroundColor: '#EAF2F8', border: '1px solid #B0C8D9' }}
            >
              {/* Row 1: Icon + Name | Status badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0">{getSensorIcon(key)}</span>
                  <span className="font-semibold text-sm truncate" style={{ color: '#2F4156' }}>
                    {name}
                  </span>
                </div>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2"
                  style={{ backgroundColor: statusClr.bg, color: statusClr.text }}
                >
                  {status}
                </span>
              </div>

              {/* Row 2: Big value */}
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold leading-none" style={{ color: '#2F4156' }}>
                  {value.toFixed(1)}
                </span>
                <span className="text-sm font-medium" style={{ color: '#567C8D' }}>
                  {unit}
                </span>
              </div>

              {/* Row 3: Progress bar */}
              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Row 4: Percentage | Max */}
              <div className="flex items-center justify-between text-xs" style={{ color: '#567C8D' }}>
                <span className="font-medium">{Math.round(percentage)}% of max</span>
                <span>
                  Max&nbsp;{maxValue}&nbsp;{unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quality Assessment summary */}
      {sensors && (
        <div className="mt-6 pt-5" style={{ borderTop: '1.5px solid #C8D9E6' }}>
          <h4 className="text-sm font-bold mb-3" style={{ color: '#2F4156' }}>
            Quality Assessment
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sensors.pm25 !== undefined && (
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: '#EAF2F8', border: '1px solid #B0C8D9' }}
              >
                <p className="text-xs mb-0.5" style={{ color: '#567C8D' }}>PM2.5 Level</p>
                <p className="text-base font-bold" style={{ color: '#2F4156' }}>
                  {sensors.pm25 <= 50
                    ? 'Very Good'
                    : sensors.pm25 <= 100
                    ? 'Good'
                    : sensors.pm25 <= 150
                    ? 'Moderate'
                    : sensors.pm25 <= 250
                    ? 'Poor'
                    : 'Very Poor'}
                </p>
              </div>
            )}
            {sensors.temperature !== undefined && sensors.humidity !== undefined && (
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: '#EAF2F8', border: '1px solid #B0C8D9' }}
              >
                <p className="text-xs mb-0.5" style={{ color: '#567C8D' }}>Climate Comfort</p>
                <p className="text-base font-bold" style={{ color: '#2F4156' }}>
                  {sensors.temperature >= 15 &&
                  sensors.temperature <= 30 &&
                  sensors.humidity >= 30 &&
                  sensors.humidity <= 60
                    ? 'Optimal'
                    : 'Suboptimal'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SensorBars;
