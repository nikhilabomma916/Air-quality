import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const TrendChart = ({ data = [], field = 'pm25' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl shadow-lg p-6 h-96 flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <p style={{ color: '#567C8D' }}>No data available for trend</p>
      </div>
    );
  }

  const getFieldLabel = (field) => {
    const labels = {
      pm25: 'PM2.5 (µg/m³)',
      co: 'CO (ppm)',
      co2: 'CO2 (ppm)',
      smoke: 'Smoke (µg/m³)',
      temperature: 'Temperature (°C)',
      humidity: 'Humidity (%)',
    };
    return labels[field] || field;
  };

  return (
    <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
      <h3 className="text-xl font-bold mb-4" style={{ color: '#2F4156' }}>Trend Analysis - {getFieldLabel(field)}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp"
            tickFormatter={(ts) => new Date(ts * 1000).toLocaleTimeString()}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(ts) => new Date(ts * 1000).toLocaleString()}
            formatter={(value) => [value?.toFixed(2), getFieldLabel(field)]}
          />
          <Line
            type="monotone"
            dataKey={field}
            stroke="#567C8D"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SmartAQIChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl shadow-lg p-6 h-96 flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <p style={{ color: '#567C8D' }}>No AQI data available</p>
      </div>
    );
  }

  const slicedData = data.slice(-20); // Last 20 readings

  return (
    <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
      <h3 className="text-xl font-bold mb-4" style={{ color: '#2F4156' }}>Smart AQI Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={slicedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(ts) => new Date(ts * 1000).toLocaleTimeString()}
          />
          <YAxis domain={[0, 100]} />
          <Tooltip
            labelFormatter={(ts) => new Date(ts * 1000).toLocaleString()}
            formatter={(value) => [value?.toFixed(2), 'Smart AQI']}
          />
          <Bar dataKey="aqi_value" fill="#567C8D" name="Smart AQI" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
