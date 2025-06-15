import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Define the IConfig interface
interface IConfig {
    port: number;
    nodeEnv: string;
    databaseUrl: string;
    jwtSecret: string;
    googleClientId: string;
    googleClientSecret: string;
    linkedinClientId: string;
    linkedinClientSecret: string;
    frontendUrl: string; // For CORS and OAuth redirects
  }

// Map environment variables to the IConfig interface
const config: IConfig = {
    port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/beehive_db',
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkeythatshouldbeverylongandrandom',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  linkedinClientId: process.env.LINKEDIN_CLIENT_ID || '',
  linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173', // My React default port
};

// Basic validation for critical environment variables
if (!config.jwtSecret || config.jwtSecret === 'supersecretjwtkeythatshouldbeverylongandrandom') {
    console.warn('WARNING: JWT_SECRET is not set or using default. Please set a strong secret in your .env file!');
  }
  if (!config.databaseUrl || config.databaseUrl === 'postgresql://user:password@localhost:5432/beehive_db') {
      console.warn('WARNING: DATABASE_URL is not set or using default. Please configure your PostgreSQL connection in your .env file!');
  }
  if (config.nodeEnv === 'production' && (!config.googleClientId || !config.googleClientSecret || !config.linkedinClientId || !config.linkedinClientSecret)) {
      console.warn('WARNING: OAuth client IDs/secrets are not set for production. Ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET are configured.');
  }
  
  
  
export default config;