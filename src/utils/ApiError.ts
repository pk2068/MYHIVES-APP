// src/utils/ApiError.ts

import httpStatus from 'http-status'; // Ensure you have 'http-status' installed (npm install http-status)

/**
 * @extends Error
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture stack trace only if not provided and in development
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}