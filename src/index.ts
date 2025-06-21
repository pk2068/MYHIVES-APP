
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import config from './config/index.js';
import errorHandler, {CustomError} from './middleware/errorHandler.js'; // Import the error handler

// You'll import your routes here as you create them
 import authRoutes from './routes/authRoutes.js';
 import locationRoutes from './routes/locationRoutes.js';
 import majorInspectionRoutes from './routes/majorInspectionRoutes.js';
import hiveInspectionRoutes from './routes/hiveInspectionRoutes.js';

const app: Application = express();

// --- Middleware ---
// ... (existing middleware like cors, helmet, morgan, express.json, express.urlencoded) ...
// Enable CORS - allows requests from your frontend domain
// In production, tighten this to specific origins
app.use(cors({
  origin: config.frontendUrl, // Allow requests from your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Allow cookies to be sent
}));

// Add security headers (helps prevent common web vulnerabilities)
app.use(helmet());

// Logging HTTP requests to the console
// 'dev' format is concise, change to 'combined' for more details in production
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
// Basic health check route
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'BeeHive API is running!' });
});

// Mount your API routes here
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/locations', locationRoutes);
// For nested routes, you might pass sequelize instances or use controllers directly
app.use('/api/v1/locations/:locationId/major-inspections', majorInspectionRoutes);
app.use('/api/v1/locations/:locationId/major-inspections/:majorInspectionId/hive-inspections', hiveInspectionRoutes);


// --- Error Handling Middleware ---

// Catch 404 Not Found errors
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`) as CustomError; // Cast to CustomError
  error.statusCode = 404; // Set 404 status
  next(error); // Pass the error to the next middleware (our errorHandler)
});

// Centralized error handler
app.use(errorHandler); // This MUST be the last middleware in your chain

export default app;

