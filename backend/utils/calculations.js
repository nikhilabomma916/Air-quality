/**
 * Health Impact Score Calculation
 * Based on weighted formula:
 * PM2.5 -> 40% | CO -> 20% | CO2 -> 10% | Smoke -> 20% | Temp/Humidity -> 10%
 */
export function calculateHealthScore(sensorData) {
  const {
    pm25 = 0,
    co = 0,
    co2 = 0,
    smoke = 0,
    temperature = 25,
    humidity = 60,
  } = sensorData;

  // Normalize values to 0-100 scale
  const pm25Score = normalizePM25(pm25);
  const coScore = normalizeCO(co);
  const co2Score = normalizeCO2(co2);
  const smokeScore = normalizeSmoke(smoke);
  const tempHumidityScore = normalizeTempHumidity(temperature, humidity);

  // Weighted calculation
  const healthScore =
    pm25Score * 0.4 +
    coScore * 0.2 +
    co2Score * 0.1 +
    smokeScore * 0.2 +
    tempHumidityScore * 0.1;

  const level = determineLevel(healthScore);

  return {
    score: Math.round(healthScore * 100) / 100,
    level,
  };
}

/**
 * Smart AQI - Sensor Fusion
 * Combines all sensor values into one index
 */
export function calculateSmartAQI(sensorData) {
  const {
    pm25 = 0,
    co = 0,
    co2 = 0,
    smoke = 0,
    temperature = 25,
    humidity = 60,
  } = sensorData;

  // Normalize all values
  const pm25Norm = pm25 / 500; // Normalize to 0-1
  const coNorm = co / 100;
  const co2Norm = co2 / 2000;
  const smokeNorm = smoke / 300;
  const tempHumidityNorm = (100 - Math.abs(temperature - 25) - Math.abs(humidity - 60)) / 100;

  // Clamp values between 0-1
  const clamp = (val) => Math.max(0, Math.min(1, val));

  const aqi =
    clamp(pm25Norm) * 0.4 +
    clamp(coNorm) * 0.2 +
    clamp(co2Norm) * 0.1 +
    clamp(smokeNorm) * 0.2 +
    clamp(tempHumidityNorm) * 0.1;

  // Convert to 0-100 scale
  const smartAQI = aqi * 100;

  return Math.round(smartAQI * 100) / 100;
}

// Normalization functions
function normalizePM25(pm25) {
  // 0-50: 0 | 50-100: 25 | 100-200: 50 | 200-500: 75 | 500+: 100
  if (pm25 <= 50) return 0;
  if (pm25 <= 100) return 25;
  if (pm25 <= 200) return 50;
  if (pm25 <= 300) return 75;
  return 100;
}

function normalizeCO(co) {
  // 0-5: 0 | 5-10: 25 | 10-20: 50 | 20-50: 75 | 50+: 100
  if (co <= 5) return 0;
  if (co <= 10) return 25;
  if (co <= 20) return 50;
  if (co <= 50) return 75;
  return 100;
}

function normalizeCO2(co2) {
  // 0-500: 0 | 500-1000: 25 | 1000-1500: 50 | 1500-2000: 75 | 2000+: 100
  if (co2 <= 500) return 0;
  if (co2 <= 1000) return 25;
  if (co2 <= 1500) return 50;
  if (co2 <= 2000) return 75;
  return 100;
}

function normalizeSmoke(smoke) {
  // 0-50: 0 | 50-100: 25 | 100-200: 50 | 200-300: 75 | 300+: 100
  if (smoke <= 50) return 0;
  if (smoke <= 100) return 25;
  if (smoke <= 200) return 50;
  if (smoke <= 300) return 75;
  return 100;
}

function normalizeTempHumidity(temperature, humidity) {
  // Ideal: temp 20-28, humidity 40-70
  const tempDiff = Math.abs(temperature - 24); // ideal temp
  const humidityDiff = Math.abs(humidity - 55); // ideal humidity

  const tempScore = Math.max(0, 100 - tempDiff * 5);
  const humidityScore = Math.max(0, 100 - humidityDiff * 2);

  return (tempScore + humidityScore) / 2;
}

function determineLevel(score) {
  if (score <= 33) return 'GOOD';
  if (score <= 66) return 'MODERATE';
  return 'DANGEROUS';
}

/**
 * Generate Smart Alert Messages
 */
export function generateAlerts(sensorData, previousData = null) {
  const alerts = [];
  const { pm25, co, co2, smoke, temperature, humidity } = sensorData;

  // PM2.5 alerts
  if (pm25 > 250) {
    alerts.push({
      message: 'Avoid outdoor activity immediately',
      type: 'CRITICAL',
      severity: 'HIGH',
    });
  } else if (pm25 > 150) {
    alerts.push({
      message: 'Close windows and use air purifier',
      type: 'WARNING',
      severity: 'MEDIUM',
    });
  } else if (pm25 > 100) {
    alerts.push({
      message: 'Reduce outdoor activities',
      type: 'INFO',
      severity: 'LOW',
    });
  }

  // CO alerts
  if (co > 50) {
    alerts.push({
      message: 'High CO levels detected',
      type: 'CRITICAL',
      severity: 'HIGH',
    });
  }

  // Temperature alerts
  if (temperature > 40) {
    alerts.push({
      message: 'High temperature - stay hydrated',
      type: 'WARNING',
      severity: 'MEDIUM',
    });
  } else if (temperature < 0) {
    alerts.push({
      message: 'Low temperature - stay warm',
      type: 'WARNING',
      severity: 'MEDIUM',
    });
  }

  // Humidity alerts
  if (humidity > 80) {
    alerts.push({
      message: 'High humidity - risk of mold',
      type: 'INFO',
      severity: 'LOW',
    });
  } else if (humidity < 30) {
    alerts.push({
      message: 'Low humidity - dry air detected',
      type: 'INFO',
      severity: 'LOW',
    });
  }

  // Trend alerts
  if (previousData) {
    const pm25Trend = pm25 - previousData.pm25;
    if (pm25Trend > 50) {
      alerts.push({
        message: 'Air quality worsening rapidly',
        type: 'ALERT',
        severity: 'MEDIUM',
      });
    } else if (pm25Trend < -30) {
      alerts.push({
        message: 'Air quality improving',
        type: 'POSITIVE',
        severity: 'LOW',
      });
    }
  }

  return alerts;
}

/**
 * Calculate trends from historical data
 */
export function calculateTrend(readings, fieldName = 'pm25') {
  if (readings.length < 2) return null;

  const n = readings.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;

  readings.forEach((reading, index) => {
    const x = index;
    const y = reading[fieldName] || 0;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return {
    slope,
    intercept,
    trend: slope > 0.5 ? 'INCREASING' : slope < -0.5 ? 'DECREASING' : 'STABLE',
    prediction: readings[n - 1][fieldName] + slope,
  };
}
