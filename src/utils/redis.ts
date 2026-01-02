import { createClient } from 'redis';
import config from '../config/index.js'; // Use your central config [cite: 711]

const redisClient = createClient({
  url: config.redisUrl,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connected successfully');
  } catch (err) {
    console.error('❌ Redis connection failed:', err);
    // In production, you might want to process.exit(1) here if Redis is critical
  }
};

export default redisClient;
