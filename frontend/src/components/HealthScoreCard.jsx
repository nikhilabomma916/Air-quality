import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const HealthScoreCard = ({ score = 0, level = 'GOOD', sensors = {} }) => {
  const getColor = (level) => {
    switch (level) {
      case 'GOOD':
        return 'bg-green-100 text-green-800';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'DANGEROUS':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCircleColor = (level) => {
    switch (level) {
      case 'GOOD':
        return 'from-green-400 to-green-600';
      case 'MODERATE':
        return 'from-yellow-400 to-yellow-600';
      case 'DANGEROUS':
        return 'from-red-400 to-red-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  // Calculate sensor contribution percentages
  const calculateSensorContribution = () => {
    if (!sensors || Object.keys(sensors).length === 0) return {};

    const pm25Norm = Math.min((sensors.pm25 || 0) / 250, 1) * 100;
    const coNorm = Math.min((sensors.co || 0) / 50, 1) * 100;
    const co2Norm = Math.min((sensors.co2 || 0) / 1000, 1) * 100;
    const smokeNorm = Math.min((sensors.smoke || 0) / 200, 1) * 100;
    const tempHumidNorm = Math.min(
      ((sensors.temperature || 25) / 40 + (sensors.humidity || 50) / 100) * 50,
      100
    );

    return {
      pm25: Math.round(pm25Norm),
      co: Math.round(coNorm),
      co2: Math.round(co2Norm),
      smoke: Math.round(smokeNorm),
      temp_humid: Math.round(tempHumidNorm),
    };
  };

  const contributions = calculateSensorContribution();
  const hasData = Object.keys(contributions).length > 0;

  const getSensorColor = (value) => {
    if (value <= 33) return 'from-green-400 to-green-500';
    if (value <= 66) return 'from-yellow-400 to-yellow-500';
    return 'from-red-400 to-red-500';
  };

  const getStatusIcon = () => {
    return level === 'GOOD' ? (
      <CheckCircle2 className="w-6 h-6 text-green-600" />
    ) : (
      <AlertCircle className="w-6 h-6 text-yellow-600" />
    );
  };

  return (
    <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-col items-center justify-center space-y-8">
        <h2 className="text-2xl font-bold" style={{ color: '#2F4156' }}>Health Impact Score</h2>

        {/* Main Score Circle */}
        <div
          className={`relative w-48 h-48 rounded-full bg-gradient-to-br ${getCircleColor(
            level
          )} flex items-center justify-center shadow-2xl`}
        >
          <div className="bg-white rounded-full w-40 h-40 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold" style={{ color: '#2F4156' }}>{Math.round(score)}</span>
            <span className="text-sm" style={{ color: '#567C8D' }}>/100</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-6 py-3 rounded-full ${getColor(level)} font-semibold text-lg flex items-center gap-2`}>
          {getStatusIcon()}
          {level}
        </div>

        {/* Status Message */}
        <div className="text-center text-sm max-w-xs" style={{ color: '#567C8D' }}>
          {level === 'GOOD' && '✓ Air quality acceptable. Enjoy outdoor activity.'}
          {level === 'MODERATE' && '⚠ Air quality is moderate. Limit outdoor activities.'}
          {level === 'DANGEROUS' && '✗ Air quality is dangerous. Avoid outdoor activities.'}
        </div>

        {/* Sensor Contributions */}
        {hasData && (
          <div className="w-full pt-6" style={{ borderTop: '2px solid #C8D9E6' }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: '#2F4156' }}>Sensor Contributions to Score</h3>
            <div className="space-y-3">
              {/* PM2.5 */}
              {contributions.pm25 !== undefined && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold" style={{ color: '#2F4156' }}>PM2.5</span>
                    <span className="text-sm font-bold" style={{ color: '#2F4156' }}>{contributions.pm25}%</span>
                  </div>
                  <div className="w-full h-2 overflow-hidden" style={{ backgroundColor: '#C8D9E6' }}>
                    <div
                      className={`h-full bg-gradient-to-r ${getSensorColor(contributions.pm25)} transition-all duration-300`}
                      style={{ width: `${contributions.pm25}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* CO */}
              {contributions.co !== undefined && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold" style={{ color: '#2F4156' }}>CO</span>
                    <span className="text-sm font-bold" style={{ color: '#2F4156' }}>{contributions.co}%</span>
                  </div>
                  <div className="w-full h-2 overflow-hidden" style={{ backgroundColor: '#C8D9E6' }}>
                    <div
                      className={`h-full bg-gradient-to-r ${getSensorColor(contributions.co)} transition-all duration-300`}
                      style={{ width: `${contributions.co}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* CO2 */}
              {contributions.co2 !== undefined && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold" style={{ color: '#2F4156' }}>CO₂</span>
                    <span className="text-sm font-bold" style={{ color: '#2F4156' }}>{contributions.co2}%</span>
                  </div>
                  <div className="w-full h-2 overflow-hidden" style={{ backgroundColor: '#C8D9E6' }}>
                    <div
                      className={`h-full bg-gradient-to-r ${getSensorColor(contributions.co2)} transition-all duration-300`}
                      style={{ width: `${contributions.co2}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Smoke */}
              {contributions.smoke !== undefined && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold" style={{ color: '#2F4156' }}>Smoke</span>
                    <span className="text-sm font-bold" style={{ color: '#2F4156' }}>{contributions.smoke}%</span>
                  </div>
                  <div className="w-full h-2 overflow-hidden" style={{ backgroundColor: '#C8D9E6' }}>
                    <div
                      className={`h-full bg-gradient-to-r ${getSensorColor(contributions.smoke)} transition-all duration-300`}
                      style={{ width: `${contributions.smoke}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Temperature & Humidity */}
              {contributions.temp_humid !== undefined && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold" style={{ color: '#2F4156' }}>Temp/Humidity</span>
                    <span className="text-sm font-bold" style={{ color: '#2F4156' }}>{contributions.temp_humid}%</span>
                  </div>
                  <div className="w-full h-2 overflow-hidden" style={{ backgroundColor: '#C8D9E6' }}>
                    <div
                      className={`h-full bg-gradient-to-r ${getSensorColor(contributions.temp_humid)} transition-all duration-300`}
                      style={{ width: `${contributions.temp_humid}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthScoreCard;
