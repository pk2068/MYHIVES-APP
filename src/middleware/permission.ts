import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { CustomError } from './errorHandler.js';

/**
 * AuthorizeRole Middleware Factory
 *
 * Validates that the authenticated user possesses one of the required roles.
 * Must be mounted after the isAuthenticated middleware, couse that one fills the req.currentUser with roles
 */
export const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Context Verification
      // Ensure req.currentUser has been populated by the authentication layer.
      if (!req.currentUser) {
        const error = new Error('Authentication required for authorization check.') as CustomError;
        error.statusCode = httpStatus.UNAUTHORIZED; // 401
        throw error;
      }

      // 2. Role Extraction and Normalization
      // In MyHives, roles may be stored as an array or a comma-separated string in the JWT.
      const userRoles = Array.isArray(req.currentUser.roles) ? req.currentUser.roles : (req.currentUser.roles as string).split(',').filter((r) => r.length > 0);

      // 3. Permission Validation
      // Check if any of the user's roles match the allowedRoles list.
      const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

      // console.log('authorizeRole Middleware - User Roles from JWT:', userRoles);
      // console.log('authorizeRole Middleware - Allowed Roles for this route:', allowedRoles);
      // console.log('authorizeRole Middleware - Permission Granted:', hasPermission);

      if (!hasPermission) {
        const error = new Error('Forbidden: Insufficient permissions to access this resource.') as CustomError;
        error.statusCode = httpStatus.FORBIDDEN; // 403
        throw error;
      }

      // 4. Authorized Access
      // User meets criteria; proceed to the next middleware or controller.
      next();
    } catch (error) {
      // Propagation to global error handler
      next(error);
    }
  };
};
