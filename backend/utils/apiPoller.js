import axios from 'axios';
import { query } from '../db/index.js';
import {
  calculateHealthScore,
  calculateSmartAQI,
  generateAlerts,
} from './calculations.js';
import dotenv from 'dotenv';

dotenv.config();

let pollingInterval = null;
let lastSensorData = {};

/**
 * Fetch data from external API and store in database
 */
export async function pollExternalAPI(websocketBroadcast) {
  try {
    if (!process.env.API_KEY || process.env.API_KEY === 'YOUR_API_KEY_HERE') {
      console.log('⚠️  API_KEY not configured in .env');
      console.log('   Please set API_KEY and API_URL to fetch real sensor data');
      return;
    }

    if (!process.env.API_URL || process.env.API_URL === 'YOUR_API_ENDPOINT_HERE') {
      console.log('⚠️  API_URL not configured in .env');
      return;
    }

    const response = await axios.get(process.env.API_URL, {
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
      },
      timeout: 10000,
    });

    const apiData = response.data;
    
    // Handle different API response formats
    if (Array.isArray(apiData)) {
      for (const data of apiData) {
        await processSensorData(data, websocketBroadcast);
      }
    } else if (apiData && typeof apiData === 'object') {
      await processSensorData(apiData, websocketBroadcast);
    }
  } catch (error) {
    console.error('❌ API Polling Error:', error.message);
  }
}

/**
 * Generate mock sensor data when API is not available
 */
function generateMockData(websocketBroadcast) {
  // Generate realistic sensor data
  const mockDevices = ['node_1', 'node_2', 'node_3', 'node_4', 'node_5'];
  const locations = [
    { lat: 17.385, lon: 78.486 }, // Hyderabad
    { lat: 17.372, lon: 78.474 },
    { lat: 17.397, lon: 78.510 },
    { lat: 17.361, lon: 78.475 },
    { lat: 17.379, lon: 78.505 },
  ];

  mockDevices.forEach((device, index) => {
    const mockData = {
      device_id: device,
      latitude: locations[index].lat + (Math.random() - 0.5) * 0.01,
      longitude: locations[index].lon + (Math.random() - 0.5) * 0.01,
      pm25: Math.max(10, 50 + Math.random() * 150 + Math.sin(Date.now() / 10000) * 30),
      co: Math.max(2, 5 + Math.random() * 20),
      co2: Math.max(300, 400 + Math.random() * 300),
      smoke: Math.max(5, 20 + Math.random() * 60),
      temperature: 25 + Math.random() * 10,
      humidity: 50 + Math.random() * 30,
      timestamp: Math.floor(Date.now() / 1000),
    };

    processSensorData(mockData, websocketBroadcast);
  });
}

/**
 * Process individual sensor data
 */
async function processSensorData(sensorData, websocketBroadcast) {
  try {
    const {
      device_id,
      latitude,
      longitude,
      pm25,
      co,
      co2,
      smoke,
      temperature,
      humidity,
      timestamp,
    } = sensorData;

    // Store raw sensor data
    const sensorResult = await query(
      `INSERT INTO sensor_data 
       (device_id, latitude, longitude, pm25, co, co2, smoke, temperature, humidity, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [device_id, latitude, longitude, pm25, co, co2, smoke, temperature, humidity, timestamp]
    );

    const sensorDataId = sensorResult.rows[0].id;

    // Calculate health score
    const healthScore = calculateHealthScore(sensorData);
    await query(
      `INSERT INTO health_scores (sensor_data_id, device_id, score, level, timestamp)
       VALUES ($1, $2, $3, $4, $5)`,
      [sensorDataId, device_id, healthScore.score, healthScore.level, timestamp]
    );

    // Calculate smart AQI
    const smartAQI = calculateSmartAQI(sensorData);
    await query(
      `INSERT INTO smart_aqi (sensor_data_id, device_id, aqi_value, timestamp)
       VALUES ($1, $2, $3, $4)`,
      [sensorDataId, device_id, smartAQI, timestamp]
    );

    // Generate alerts
    const previousData = lastSensorData[device_id];
    const alerts = generateAlerts(sensorData, previousData);

    if (alerts.length > 0) {
      for (const alert of alerts) {
        await query(
          `INSERT INTO alerts (device_id, alert_message, alert_type, severity, timestamp)
           VALUES ($1, $2, $3, $4, $5)`,
          [device_id, alert.message, alert.type, alert.severity, timestamp]
        );
      }
    }

    // Prepare data for WebSocket broadcast
    const broadcastData = {
      device_id,
      latitude,
      longitude,
      pm25,
      co,
      co2,
      smoke,
      temperature,
      humidity,
      timestamp,
      healthScore,
      smartAQI,
      alerts,
    };

    // Store last data for trend calculation
    lastSensorData[device_id] = sensorData;

    // Broadcast via WebSocket
    if (websocketBroadcast) {
      websocketBroadcast(broadcastData);
    }

    console.log(`✓ Processed sensor data from ${device_id}`);
  } catch (error) {
    console.error('Error processing sensor data:', error.message);
  }
}

/**
 * Start polling external API
 */
export function startPolling(websocketBroadcast) {
  const interval = parseInt(process.env.API_POLL_INTERVAL) || 5000;

  console.log(`🔄 Starting API polling every ${interval}ms...`);

  // Initial poll
  pollExternalAPI(websocketBroadcast);

  // Set interval
  pollingInterval = setInterval(() => {
    pollExternalAPI(websocketBroadcast);
  }, interval);
}

/**
 * Stop polling
 */
export function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    console.log('Stopped API polling');
  }
}
