import React from 'react';
import { Wind } from 'lucide-react';

export default function AQIGauge({ aqi = 0, level = 'GOOD' }) {
  const getAQIColor = (value) => {
    if (value <= 50) return '#10b981'; // Good - Green
    if (value <= 100) return '#f59e0b'; // Moderate - Yellow
    if (value <= 150) return '#f97316'; // Unhealthy for Sensitive - Orange
    if (value <= 200) return '#ef4444'; // Unhealthy - Red
    if (value <= 300) return '#8b5cf6'; // Very Unhealthy - Purple
    return '#6b21a8'; // Hazardous - Dark Purple
  };

  const getAQICategory = (value) => {
    if (value <= 50) return { name: 'GOOD', desc: 'Air quality is satisfactory' };
    if (value <= 100) return { name: 'MODERATE', desc: 'Acceptable air quality' };
    if (value <= 150) return { name: 'UNHEALTHY FOR SENSITIVE', desc: 'Sensitive groups affected' };
    if (value <= 200) return { name: 'UNHEALTHY', desc: 'General public affected' };
    if (value <= 300) return { name: 'VERY UNHEALTHY', desc: 'Health alert' };
    return { name: 'HAZARDOUS', desc: 'Emergency conditions' };
  };

  const category = getAQICategory(aqi);
  const color = getAQIColor(aqi);
  
  // Calculate the rotation angle for the needle (0-180 degrees for 0-500 AQI)
  const maxAQI = 500;
  const angle = (Math.min(aqi, maxAQI) / maxAQI) * 180 - 90;

  return (
    <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="flex items-center gap-3 mb-6">
        <Wind className="w-6 h-6" style={{ color: '#2F4156' }} />
        <h3 className="text-2xl font-bold" style={{ color: '#2F4156' }}>Live AQI Gauge</h3>
      </div>

      <div className="flex flex-col items-center">
        {/* Gauge Container */}
        <div className="relative w-64 h-32 mb-8">
          {/* Gauge Background */}
          <svg className="w-full h-full" viewBox="0 0 200 100">
            {/* Good (0-50) - Green */}
            <path
              d="M 20 90 A 80 80 0 0 1 60 15"
              fill="none"
              stroke="#10b981"
              strokeWidth="12"
            />
            {/* Moderate (50-100) - Yellow */}
            <path
              d="M 60 15 A 80 80 0 0 1 100 10"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="12"
            />
            {/* Unhealthy Sensitive (100-150) - Orange */}
            <path
              d="M 100 10 A 80 80 0 0 1 140 15"
              fill="none"
              stroke="#f97316"
              strokeWidth="12"
            />
            {/* Unhealthy (150-200) - Red */}
            <path
              d="M 140 15 A 80 80 0 0 1 180 90"
              fill="none"
              stroke="#ef4444"
              strokeWidth="12"
            />

            {/* Center circle */}
            <circle cx="100" cy="90" r="8" fill={color} />

            {/* Needle */}
            <g transform={`rotate(${angle} 100 90)`}>
              <line x1="100" y1="90" x2="100" y2="20" stroke={color} strokeWidth="3" />
              <circle cx="100" cy="90" r="6" fill={color} />
            </g>

            {/* Labels */}
            <text x="25" y="95" fontSize="10" fill="#2F4156" fontWeight="bold">0</text>
            <text x="95" y="8" fontSize="10" fill="#2F4156" fontWeight="bold">500</text>
            <text x="170" y="95" fontSize="10" fill="#2F4156" fontWeight="bold">500+</text>
          </svg>
        </div>

        {/* AQI Value Display */}
        <div className="text-center mb-4">
          <p className="text-5xl font-bold mb-2" style={{ color: color }}>
            {Math.round(aqi)}
          </p>
          <p className="text-lg font-semibold" style={{ color: '#2F4156' }}>
            {category.name}
          </p>
          <p className="text-sm mt-1" style={{ color: '#567C8D' }}>
            {category.desc}
          </p>
        </div>

        {/* AQI Scale Legend */}
        <div className="w-full mt-8 grid grid-cols-3 gap-2">
          <div className="p-3 rounded text-center" style={{ backgroundColor: '#C8D9E6' }}>
            <p className="text-xs font-bold" style={{ color: '#2F4156' }}>0-50</p>
            <p className="text-xs mt-1" style={{ color: '#567C8D' }}>Good</p>
          </div>
          <div className="p-3 rounded text-center" style={{ backgroundColor: '#C8D9E6' }}>
            <p className="text-xs font-bold" style={{ color: '#2F4156' }}>51-100</p>
            <p className="text-xs mt-1" style={{ color: '#567C8D' }}>Moderate</p>
          </div>
          <div className="p-3 rounded text-center" style={{ backgroundColor: '#C8D9E6' }}>
            <p className="text-xs font-bold" style={{ color: '#2F4156' }}>100+</p>
            <p className="text-xs mt-1" style={{ color: '#567C8D' }}>Unhealthy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
