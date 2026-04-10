import express from 'express';
import { query } from '../db/index.js';
import { calculateTrend } from '../utils/calculations.js';

const router = express.Router();

/**
 * GET /api/latest - Get latest sensor data
 */
router.get('/latest', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        sd.id, sd.device_id, sd.latitude, sd.longitude,
        sd.pm25, sd.co, sd.co2, sd.smoke, sd.temperature, sd.humidity, sd.timestamp,
        hs.score as health_score, hs.level,
        sa.aqi_value as smart_aqi
       FROM sensor_data sd
       LEFT JOIN health_scores hs ON sd.id = hs.sensor_data_id
       LEFT JOIN smart_aqi sa ON sd.id = sa.sensor_data_id
       ORDER BY sd.timestamp DESC
       LIMIT 10`
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching latest data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/history - Get historical sensor data with optional filters
 */
router.get('/history', async (req, res) => {
  try {
    const { device_id, limit = 100, offset = 0 } = req.query;

    let queryText = `
      SELECT 
        sd.id, sd.device_id, sd.latitude, sd.longitude,
        sd.pm25, sd.co, sd.co2, sd.smoke, sd.temperature, sd.humidity, sd.timestamp,
        hs.score as health_score, hs.level,
        sa.aqi_value as smart_aqi
       FROM sensor_data sd
       LEFT JOIN health_scores hs ON sd.id = hs.sensor_data_id
       LEFT JOIN smart_aqi sa ON sd.id = sa.sensor_data_id
    `;
    const params = [];

    if (device_id) {
      queryText += ` WHERE sd.device_id = $1`;
      params.push(device_id);
    }

    queryText += ` ORDER BY sd.timestamp DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/devices - Get all registered devices
 */
router.get('/devices', async (req, res) => {
  try {
    const result = await query(
      `SELECT DISTINCT device_id FROM sensor_data ORDER BY device_id`
    );

    res.json({
      success: true,
      devices: result.rows.map((r) => r.device_id),
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/device/:deviceId/latest - Get latest data for specific device
 */
router.get('/device/:deviceId/latest', async (req, res) => {
  try {
    const { deviceId } = req.params;

    const result = await query(
      `SELECT 
        sd.id, sd.device_id, sd.latitude, sd.longitude,
        sd.pm25, sd.co, sd.co2, sd.smoke, sd.temperature, sd.humidity, sd.timestamp,
        hs.score as health_score, hs.level,
        sa.aqi_value as smart_aqi
       FROM sensor_data sd
       LEFT JOIN health_scores hs ON sd.id = hs.sensor_data_id
       LEFT JOIN smart_aqi sa ON sd.id = sa.sensor_data_id
       WHERE sd.device_id = $1
       ORDER BY sd.timestamp DESC
       LIMIT 1`,
      [deviceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching device latest:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/device/:deviceId/trend - Get trend analysis for device
 */
router.get('/device/:deviceId/trend', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { field = 'pm25', limit = 20 } = req.query;

    const result = await query(
      `SELECT pm25, co, co2, smoke, temperature, humidity, timestamp
       FROM sensor_data
       WHERE device_id = $1
       ORDER BY timestamp DESC
       LIMIT $2`,
      [deviceId, limit]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found' });
    }

    const readings = result.rows.reverse();
    const trend = calculateTrend(readings, field);

    res.json({
      success: true,
      device_id: deviceId,
      field,
      readings: readings,
      trend,
    });
  } catch (error) {
    console.error('Error calculating trend:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/report - Get daily/weekly report
 */
router.get('/report', async (req, res) => {
  try {
    const { period = 'daily' } = req.query;

    let result;
    if (period === 'daily') {
      result = await query(
        `SELECT * FROM daily_reports ORDER BY report_date DESC LIMIT 30`
      );
    } else {
      // Weekly aggregation
      result = await query(
        `SELECT 
          DATE_TRUNC('week', created_at) as week,
          AVG(aqi_value) as avg_aqi,
          MAX(aqi_value) as max_aqi,
          MIN(aqi_value) as min_aqi
         FROM smart_aqi
         GROUP BY DATE_TRUNC('week', created_at)
         ORDER BY week DESC
         LIMIT 12`
      );
    }

    res.json({
      success: true,
      period,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/alerts - Get recent alerts
 */
router.get('/alerts', async (req, res) => {
  try {
    const { limit = 20, severity } = req.query;

    let queryText = `SELECT * FROM alerts`;
    const params = [];

    if (severity) {
      queryText += ` WHERE severity = $1`;
      params.push(severity);
    }

    queryText += ` ORDER BY timestamp DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/map-data - Get all device locations for map
 */
router.get('/map-data', async (req, res) => {
  try {
    const result = await query(
      `SELECT DISTINCT ON (sd.device_id)
        sd.device_id, sd.latitude, sd.longitude,
        sd.pm25, sd.temperature, sd.humidity, sd.timestamp,
        hs.score as health_score, hs.level,
        sa.aqi_value as smart_aqi
       FROM sensor_data sd
       LEFT JOIN health_scores hs ON sd.id = hs.sensor_data_id
       LEFT JOIN smart_aqi sa ON sd.id = sa.sensor_data_id
       ORDER BY sd.device_id, sd.timestamp DESC`
    );

    res.json({
      success: true,
      devices: result.rows,
    });
  } catch (error) {
    console.error('Error fetching map data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/stats - Get aggregate statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        COUNT(DISTINCT device_id) as total_devices,
        COUNT(*) as total_readings,
        ROUND(AVG(pm25)::numeric, 2) as avg_pm25,
        ROUND(AVG(co)::numeric, 2) as avg_co,
        ROUND(AVG(co2)::numeric, 2) as avg_co2,
        ROUND(AVG(temperature)::numeric, 2) as avg_temperature,
        ROUND(AVG(humidity)::numeric, 2) as avg_humidity,
        MAX(pm25) as max_pm25,
        MAX(temperature) as max_temperature
       FROM sensor_data
       WHERE timestamp > (EXTRACT(EPOCH FROM NOW()) - 3600)`
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
