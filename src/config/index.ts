import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's path
const __filename = fileURLToPath(import.meta.url);

console.log('Current file path:', __filename);
console.log(import.meta.url);

// Get the current directory's path
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
const dotEnvConfigObject = dotenv.config({ path: path.resolve(__dirname, '../../src/.env') });
console.log('dotenv config object:', dotEnvConfigObject);
console.log('#############################-');
// Define the IConfig interface
interface IConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  refreshTokenSecret: string;
  googleClientId: string;
  googleClientSecret: string;
  linkedinClientId: string;
  linkedinClientSecret: string;
  frontendUrl: string; // For CORS and OAuth redirects
  redisUrl: string; // Optional Redis URL
}

// Map environment variables to the IConfig interface
const config: IConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/beehive_db',
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkeythatshouldbeverylongandrandom',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'supersecretrefreshjwtokenkeythatshouldbeverylongandrandom',
  googleClientId: process.env.GOOGLE_CLIENT_ID || 'foobar',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || 'foobarsecret',
  linkedinClientId: process.env.LINKEDIN_CLIENT_ID || '',
  linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173', // My React default port
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379', // Default Redis URL
};

// console.log('Config loaded:', config);
// console.log('config.jwtSecret:', config.jwtSecret);

// console.log('Loaded GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
// console.log('Client ID length:', process.env.GOOGLE_CLIENT_ID?.length); // Should be around 80-90 chars
// console.log('Loaded GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET?.substring(0, 10) + '...'); // Show first 10 chars only

// Basic validation for critical environment variables
if (!config.jwtSecret || config.jwtSecret === 'supersecretjwtkeythatshouldbeverylongandrandom') {
  console.warn('WARNING: JWT_SECRET is not set or using default. Please set a strong secret in your .env file!');
}
if (!config.refreshTokenSecret || config.refreshTokenSecret === 'supersecretrefreshjwtokenkeythatshouldbeverylongandrandom') {
  console.warn('WARNING: REFRESH_TOKEN_SECRET is not set or using default. Please set a strong secret in your .env file!');
}

if (!config.databaseUrl || config.databaseUrl === 'unknown') {
  console.warn('WARNING: DATABASE_URL is not set or using default. Please configure your PostgreSQL connection in your .env file!');
}
if (config.nodeEnv === 'production' && (!config.googleClientId || !config.googleClientSecret || !config.linkedinClientId || !config.linkedinClientSecret)) {
  console.warn(
    'WARNING: OAuth client IDs/secrets are not set for production. Ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET are configured.'
  );
}

export default config;
