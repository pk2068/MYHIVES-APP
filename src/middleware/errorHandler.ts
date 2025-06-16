import { Request, Response, NextFunction } from 'express';
import config from '../config';

// Define a custom error interface for better type hinting
export interface CustomError extends Error {
  statusCode?: number;
  data?: any; // Optional additional data for the error
}

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  // Determine status code: prioritize error's statusCode, then check Express's res.statusCode, fallback to 500
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong!',
    // Include stack trace only in development environment for debugging
    stack: config.nodeEnv === 'development' ? err.stack : {},
    data: err.data || null, // Include additional data if present
  });
};

export default errorHandler;