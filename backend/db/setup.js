import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Client } = pkg;
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    // Connect to PostgreSQL
    await client.connect();
    console.log('✓ Connected to PostgreSQL');

    // Create database if not exists
    const dbCheckResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [process.env.DB_NAME]
    );

    if (dbCheckResult.rows.length === 0) {
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`✓ Created database: ${process.env.DB_NAME}`);
    } else {
      console.log(`✓ Database ${process.env.DB_NAME} already exists`);
    }

    // Disconnect and connect to the specific database
    await client.end();

    const dbClient = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    await dbClient.connect();
    console.log(`✓ Connected to ${process.env.DB_NAME}`);

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await dbClient.query(schema);
    console.log('✓ Schema created successfully');

    // Initialize devices with localities
    const devices = [
      { device_id: 'device_001', name: 'Hyderabad - Nizampet', locality: 'Nizampet', address: 'Nizampet, Hyderabad', latitude: 17.4465, longitude: 78.4615 },
      { device_id: 'device_002', name: 'Hyderabad - Jubilee Hills', locality: 'Jubilee Hills', address: 'Jubilee Hills, Hyderabad', latitude: 17.3850, longitude: 78.3950 },
      { device_id: 'device_003', name: 'Hyderabad - Banjara Hills', locality: 'Banjara Hills', address: 'Banjara Hills, Hyderabad', latitude: 17.3750, longitude: 78.4150 },
      { device_id: 'device_004', name: 'Hyderabad - Hitech City', locality: 'Hitech City', address: 'Hitech City, Hyderabad', latitude: 17.3600, longitude: 78.4000 },
      { device_id: 'device_005', name: 'Hyderabad - Gachibowli', locality: 'Gachibowli', address: 'Gachibowli, Hyderabad', latitude: 17.4478, longitude: 78.3436 },
      { device_id: 'device_006', name: 'Hyderabad - HITEC Valley', locality: 'HITEC Valley', address: 'HITEC Valley, Hyderabad', latitude: 17.3695, longitude: 78.3857 }
    ];

    for (const device of devices) {
      await dbClient.query(
        `INSERT INTO devices (device_id, name, locality, address, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (device_id) DO NOTHING`,
        [device.device_id, device.name, device.locality, device.address, device.latitude, device.longitude]
      );
    }
    console.log('✓ Devices initialized with localities');

    // Create initial dummy data for each device
    for (const device of devices) {
      await dbClient.query(
        `INSERT INTO sensor_data (device_id, latitude, longitude, pm25, co, co2, smoke, temperature, humidity, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT DO NOTHING`,
        [device.device_id, device.latitude, device.longitude, 45, 2, 400, 10, 28, 65, Math.floor(Date.now() / 1000)]
      );
    }

    await dbClient.end();
    console.log('✓ Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
