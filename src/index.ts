
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import config from './config/index';
import errorHandler from './middleware/errorHandler'; // Import the error handler

// You'll import your routes here as you create them
// import authRoutes from './routes/authRoutes';
// import locationRoutes from './routes/locationRoutes';

const app: Application = express();

// --- Middleware ---
// ... (existing middleware like cors, helmet, morgan, express.json, express.urlencoded) ...

// --- Routes ---
// Basic health check route
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'BeeHive API is running!' });
});

// Mount your API routes here
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/locations', locationRoutes);
// For nested routes, you might pass sequelize instances or use controllers directly
// app.use('/api/v1/locations/:locationId/major-inspections', majorInspectionRoutes);
// app.use('/api/v1/locations/:locationId/major-inspections/:majorInspectionId/hive-inspections', hiveInspectionRoutes);


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

// import { Client } from 'pg';

// const client = new Client({
//   user: 'postgres',         // replace if different
//   host: 'localhost',
//   database: 'myhives_db',
//   password: 'Cada_2068_new', // replace with your actual password
//   port: 5432,
// });

// async function insertUser(name: string, email: string) {
//   try {
//     await client.connect();
//     console.log('We are connected! :) ');
//     const query = 'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *';
//     const values = [name, email];

//     const result = await client.query(query, values);
//     console.log('Inserted user:', result.rows[0], result);
//   } catch (err) {
//     console.error('ERROR inserting user: :( ', err);
//   } finally {
//     await client.end();
//     console.log('We are disconnected! :) ');
//   }
// }

// insertUser('johny', 'johny@bravo.com');
