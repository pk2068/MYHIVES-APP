import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'reflect-metadata';
import config from './config/index.js';
import errorHandler, { CustomError } from './middleware/errorHandler.js'; // Import the error handler

// You'll import your routes here as you create them
import authRoutes from './routes/authRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
//import majorInspectionRoutes from './routes/majorInspectionRoutes.js';
//  import majorInspectionRoutes from './routes/majorInspectionRoutes.js';
// import hiveInspectionRoutes from './routes/hiveInspectionRoutes.js';

const app: Application = express();
const apiRouter = express.Router(); // Create a new router instance

console.log('BeeHive API configuration is starting...');
// --- Middleware ---
// ... (existing middleware like cors, helmet, morgan, express.json, express.urlencoded) ...
// Enable CORS - allows requests from your frontend domain
// In production, tighten this to specific origins
app.use(
  cors({
    origin: config.frontendUrl, // Allow requests from your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allow cookies to be sent
  })
);

console.log(`CORS enabled for origin: ${config.frontendUrl}`);

// Add security headers (helps prevent common web vulnerabilities)
app.use(helmet());

console.log('Helmet security headers applied');

// Logging HTTP requests to the console
// 'dev' format is concise, change to 'combined' for more details in production
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

console.log(`Morgan logging enabled in ${config.nodeEnv} mode`);

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

console.log('Express JSON and URL-encoded body parsers enabled');

// Mount your API router on the main app
app.use('/api/v1', apiRouter);

// --- Routes ---
// Basic health check route
apiRouter.get('/health', (req: Request, res: Response) => {
  console.log('🚑 Health check endpoint hit');
  res.status(200).json({ status: 'ok', message: 'BeeHive API is running!' });
});

console.log('Health check route added');

// Mount your API routes here
apiRouter.use('/auth', authRoutes);
apiRouter.use('/locations', locationRoutes);
apiRouter.use('/admin', adminRoutes/); // Uncomment and add adminRoutes when available

console.log('API routes mounted');
// --- Error Handling Middleware ---

// Catch 404 Not Found errors
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`) as CustomError; // Cast to CustomError
  error.statusCode = 404; // Set 404 status
  next(error); // Pass the error to the next middleware (our errorHandler)
});
console.log('404 Not Found handler added');

// Centralized error handler
app.use(errorHandler); // This MUST be the last middleware in your chain
console.log('Error handler middleware added');

export default app;
