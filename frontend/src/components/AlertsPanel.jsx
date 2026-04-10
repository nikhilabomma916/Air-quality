import React from 'react';
import { AlertTriangle, Info, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

export const AlertsPanel = ({ alerts = [] }) => {
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'HIGH':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'MEDIUM':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'LOW':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-50 border-l-4 border-l-red-600';
      case 'MEDIUM':
        return 'bg-yellow-50 border-l-4 border-l-yellow-600';
      case 'LOW':
        return 'bg-blue-50 border-l-4 border-l-blue-600';
      default:
        return 'bg-gray-50 border-l-4 border-l-gray-600';
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: '#2F4156' }}>Smart Alerts</h3>
        <div className="flex items-center justify-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mr-3" />
          <p className="text-lg" style={{ color: '#567C8D' }}>All systems nominal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
      <h3 className="text-xl font-bold mb-4" style={{ color: '#2F4156' }}>Smart Alerts ({alerts.length})</h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.slice(0, 10).map((alert, idx) => (
          <div key={idx} className={`p-4 rounded-lg ${getSeverityColor(alert.severity)}`}>
            <div className="flex items-start space-x-3">
              {getSeverityIcon(alert.severity)}
              <div className="flex-1">
                <p className="font-semibold" style={{ color: '#2F4156' }}>{alert.alert_message}</p>
                {alert.alert_type && (
                  <p className="text-sm mt-1" style={{ color: '#567C8D' }}>Type: {alert.alert_type}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;
