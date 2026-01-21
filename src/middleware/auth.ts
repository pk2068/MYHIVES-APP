import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { CustomError } from './errorHandler.js'; // Import the CustomError interface
import redisClient from '../utils/redis.js';

/**
 * Middleware to authenticate requests.
 * Now includes a Redis check to verify if the token has been blacklisted (logged out).
 */
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Authentication middleware called');
    const authHeader = req.headers.authorization;
    console.log('Token received:', req.headers.authorization);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('No token provided or invalid token format.') as CustomError;
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    const token = authHeader.split(' ')[1];

    // We check if the key 'blacklist_TOKEN' exists in our cache
    const isBlacklisted = await redisClient.get(`blacklist_${token}`);

    if (isBlacklisted) {
      console.warn('Blocked a request using a blacklisted token.');
      const error = new Error('This session has expired. Please log in again.') as CustomError;
      error.statusCode = 401;
      throw error;
    }

    // Ensure 'verifyToken' is imported correctly and handles token verification,
    // returning an object with 'userId' or throwing an error.
    const decoded = verifyToken(token);
    console.log('Decoded token \u{1F534}:', decoded);

    // This line requires your 'express.d.ts' or 'custom-request.d.ts'
    // to extend the Request interface with a 'user' property.
    req.currentUser = { id: decoded.userId, username: decoded.username, roles: decoded.roles };

    next();
  } catch (error: any) {
    console.error('Authentication error:', error);
    const err = error as CustomError;
    err.statusCode = err.statusCode || 401;
    console.error(`Error status code: ${err.statusCode}, message: ${err.message}`);
    next(err);
  }
};

// Middleware for authorization (e.g., check if user owns data)
// This is a placeholder and will be implemented within controllers or more specific middlewares

// export const authorizeOwner = async (req: Request, res: Response, next: NextFunction) => {
//     // This is an example of where you would perform authorization.
//     // For locations, you'd fetch the location by ID and check if req.user.id matches location.userId.
//     // For nested resources, you might need to check the parent resource owner.

//     // Example for a location:
//     // const locationId = req.params.id || req.params.locationId;
//     // if (!locationId || !req.user || !req.user.id) {
//     //     const error = new Error('Authentication required for authorization.') as CustomError;
//     //     error.statusCode = 401;
//     //     return next(error);
//     // }

//     // try {
//     //     const location = await LocationService.getLocationById(locationId, req.user.id);
//     //     if (!location) {
//     //         const error = new Error('Location not found or you do not have permission to access it.') as CustomError;
//     //         error.statusCode = 403; // Forbidden
//     //         throw error;
//     //     }
//     //     // If successful, continue
//     //     next();
//     // } catch (error) {
//     //     next(error);
//     // }

//     // For now, just pass through (you'll implement specific owner checks in controllers or specialized middlewares)
//     next();
// };
