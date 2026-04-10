import axios from 'axios';

const API_BASE_URL = 'http://localhost:49217/api';
const WS_URL = 'ws://localhost:49218';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Sensor Data APIs
export const getSensorLatest = async () => {
  try {
    const response = await api.get('/latest');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching latest sensor data:', error);
    return [];
  }
};

export const getSensorHistory = async (deviceId = null, limit = 100) => {
  try {
    const response = await api.get('/history', {
      params: { device_id: deviceId, limit },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching sensor history:', error);
    return [];
  }
};

export const getMapData = async () => {
  try {
    const response = await api.get('/map-data');
    return response.data.devices;
  } catch (error) {
    console.error('Error fetching map data:', error);
    return [];
  }
};

export const getDeviceLatest = async (deviceId) => {
  try {
    const response = await api.get(`/device/${deviceId}/latest`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching latest data for ${deviceId}:`, error);
    return null;
  }
};

export const getDeviceTrend = async (deviceId, field = 'pm25', limit = 20) => {
  try {
    const response = await api.get(`/device/${deviceId}/trend`, {
      params: { field, limit },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching trend for ${deviceId}:`, error);
    return null;
  }
};

export const getAllDevices = async () => {
  try {
    const response = await api.get('/devices');
    return response.data.devices;
  } catch (error) {
    console.error('Error fetching devices:', error);
    return [];
  }
};

// Alerts APIs
export const getAlerts = async (limit = 20, severity = null) => {
  try {
    const response = await api.get('/alerts', {
      params: { limit, severity },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
};

// Reports APIs
export const getReport = async (period = 'daily') => {
  try {
    const response = await api.get('/report', {
      params: { period },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching report:', error);
    return [];
  }
};

// Statistics APIs
export const getStats = async () => {
  try {
    const response = await api.get('/stats');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
};

// WebSocket connection
export const connectWebSocket = (onDataReceived, onError) => {
  try {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('✓ WebSocket connected');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      onDataReceived(message.data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (onError) onError(error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        connectWebSocket(onDataReceived, onError);
      }, 3000);
    };

    return ws;
  } catch (error) {
    console.error('WebSocket connection error:', error);
    if (onError) onError(error);
    return null;
  }
};

export default api;
