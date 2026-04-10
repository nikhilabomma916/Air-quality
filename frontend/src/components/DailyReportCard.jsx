import React from 'react';
import { Calendar, TrendingUp, TrendingDown, Clock } from 'lucide-react';

export const DailyReportCard = ({ reports = [] }) => {
  if (!reports || reports.length === 0) {
    return (
      <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: '#2F4156' }}>Daily Report</h3>
        <p style={{ color: '#567C8D' }}>No report data available yet</p>
      </div>
    );
  }

  const latestReport = reports[0];

  return (
    <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#2F4156' }}>
        <Calendar className="w-5 h-5" />
        Daily Report
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#C8D9E6' }}>
          <p className="text-sm mb-1" style={{ color: '#567C8D' }}>Average AQI</p>
          <p className="text-3xl font-bold" style={{ color: '#2F4156' }}>
            {latestReport?.avg_aqi?.toFixed(1) || '--'}
          </p>
        </div>

        <div className="p-4 rounded-lg" style={{ backgroundColor: '#C8D9E6' }}>
          <p className="text-sm mb-1" style={{ color: '#567C8D' }}>Total Readings</p>
          <p className="text-3xl font-bold" style={{ color: '#2F4156' }}>
            {latestReport?.readings_count || '--'}
          </p>
        </div>

        <div className="p-4 rounded-lg" style={{ backgroundColor: '#C8D9E6' }}>
          <p className="text-sm mb-1 flex items-center gap-1" style={{ color: '#567C8D' }}>
            <TrendingUp className="w-4 h-4" />
            Peak Pollution
          </p>
          <p className="text-2xl font-bold" style={{ color: '#2F4156' }}>
            {latestReport?.peak_pollution_time || '--'}
          </p>
        </div>

        <div className="p-4 rounded-lg" style={{ backgroundColor: '#C8D9E6' }}>
          <p className="text-sm mb-1 flex items-center gap-1" style={{ color: '#567C8D' }}>
            <Clock className="w-4 h-4" />
            Best Air Quality
          </p>
          <p className="text-2xl font-bold" style={{ color: '#2F4156' }}>
            {latestReport?.best_air_quality_time || '--'}
          </p>
        </div>
      </div>

      {reports.length > 1 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold mb-3" style={{ color: '#2F4156' }}>Recent Days</h4>
          <div className="space-y-2">
            {reports.slice(0, 5).map((report, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: '#C8D9E6' }}>
                <span className="text-sm" style={{ color: '#567C8D' }}>{report.report_date}</span>
                <span className="text-sm font-bold" style={{ color: '#2F4156' }}>
                  {report.avg_aqi?.toFixed(1) || '--'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyReportCard;
