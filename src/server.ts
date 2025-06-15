// src/server.ts

import app from './index';
import config from './config/index';
// import { connectDB } from './database'; // You'll create this function later

const startServer = async () => {
  try {
    // 1. Connect to the database
    // console.log('Attempting to connect to the database...');
    // await connectDB();
    // console.log('Database connected successfully.');

    // 2. Start the Express server
    app.listen(config.port, () => {
      console.log(`⚡️[server]: Server is running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Frontend URL for CORS: ${config.frontendUrl}`);
    });
  } catch (error) {
    console.error('❌ [server]: Failed to start server:', error);
    process.exit(1); // Exit the process with an error code
  }
};

startServer();