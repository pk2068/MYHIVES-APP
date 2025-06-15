// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { CustomError } from './errorHandler'; // Import the CustomError interface

// Middleware for authenticating requests using JWT
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Get the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('No token provided or invalid token format.') as CustomError;
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    const token = authHeader.split(' ')[1]; // Extract the token part

    // 2. Verify the token
    const decoded = verifyToken(token); // This will throw if invalid/expired

    // 3. Attach the user ID to the request object for later use in controllers
    // The `express.d.ts` file ensures `req.user` is recognized.
    req.user = { id: decoded.userId };

    // 4. Continue to the next middleware or route handler
    next();
  } catch (error: any) {
    // Catch errors from verifyToken or initial checks
    const err = error as CustomError;
    err.statusCode = err.statusCode || 401; // Default to 401 Unauthorized
    next(err); // Pass the error to the error handling middleware
  }
};

// Middleware for authorization (e.g., check if user owns data)
// This is a placeholder and will be implemented within controllers or more specific middlewares
export const authorizeOwner = async (req: Request, res: Response, next: NextFunction) => {
    // This is an example of where you would perform authorization.
    // For locations, you'd fetch the location by ID and check if req.user.id matches location.userId.
    // For nested resources, you might need to check the parent resource owner.

    // Example for a location:
    // const locationId = req.params.id || req.params.locationId;
    // if (!locationId || !req.user || !req.user.id) {
    //     const error = new Error('Authentication required for authorization.') as CustomError;
    //     error.statusCode = 401;
    //     return next(error);
    // }

    // try {
    //     const location = await LocationService.getLocationById(locationId, req.user.id);
    //     if (!location) {
    //         const error = new Error('Location not found or you do not have permission to access it.') as CustomError;
    //         error.statusCode = 403; // Forbidden
    //         throw error;
    //     }
    //     // If successful, continue
    //     next();
    // } catch (error) {
    //     next(error);
    // }

    // For now, just pass through (you'll implement specific owner checks in controllers or specialized middlewares)
    next();
};