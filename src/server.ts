// src/server.ts

import listEndpoints from 'express-list-endpoints';
import app from './appExpressInstance.js';
import config from './config/index.js';
import { connectDB } from './database/connect.js'; // You'll create this function later

const startServer = async () => {
  try {
    // 1. Connect to the database
    console.log('Attempting to connect to the database...');
    await connectDB();
    console.log('Database connected successfully.');

    // 2. Start the Express server
    console.log('Starting BeeHive API server... with app.listen');
    app.listen(config.port, () => {
      console.log(`⚡️[server]: Server is running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Frontend URL for CORS: ${config.frontendUrl}\n🙈-------------------------------------------\n\n`);
      console.log(`Swagger UI docs available at http://localhost:${config.port}/api-docs`);

      console.log(listEndpoints(app));
    });
  } catch (error) {
    console.error('❌ [server]: Failed to start server:', error);
    process.exit(1); // Exit the process with an error code
  }
};

console.log('startServer();');
startServer();
