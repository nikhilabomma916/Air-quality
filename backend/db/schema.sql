-- Create enum types
CREATE TYPE air_quality_level AS ENUM ('GOOD', 'MODERATE', 'DANGEROUS');

-- Sensor Data Table
CREATE TABLE IF NOT EXISTS sensor_data (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(50) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  pm25 FLOAT NOT NULL,
  co FLOAT NOT NULL,
  co2 FLOAT NOT NULL,
  smoke FLOAT NOT NULL,
  temperature FLOAT NOT NULL,
  humidity FLOAT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health Score Table
CREATE TABLE IF NOT EXISTS health_scores (
  id SERIAL PRIMARY KEY,
  sensor_data_id INT REFERENCES sensor_data(id) ON DELETE CASCADE,
  device_id VARCHAR(50) NOT NULL,
  score FLOAT NOT NULL,
  level air_quality_level NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Smart AQI Table
CREATE TABLE IF NOT EXISTS smart_aqi (
  id SERIAL PRIMARY KEY,
  sensor_data_id INT REFERENCES sensor_data(id) ON DELETE CASCADE,
  device_id VARCHAR(50) NOT NULL,
  aqi_value FLOAT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily Reports Table
CREATE TABLE IF NOT EXISTS daily_reports (
  id SERIAL PRIMARY KEY,
  report_date DATE NOT NULL,
  avg_aqi FLOAT,
  peak_pollution_time VARCHAR(20),
  best_air_quality_time VARCHAR(20),
  readings_count INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(report_date)
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(50) NOT NULL,
  alert_message TEXT NOT NULL,
  alert_type VARCHAR(50),
  severity VARCHAR(20),
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_sensor_data_device_id ON sensor_data(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON sensor_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_health_scores_device_id ON health_scores(device_id);
CREATE INDEX IF NOT EXISTS idx_health_scores_timestamp ON health_scores(timestamp);
CREATE INDEX IF NOT EXISTS idx_smart_aqi_device_id ON smart_aqi(device_id);
CREATE INDEX IF NOT EXISTS idx_smart_aqi_timestamp ON smart_aqi(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_device_id ON alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp);
