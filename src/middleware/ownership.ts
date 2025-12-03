import { Request, Response, NextFunction } from 'express';
import { LocationService } from '../services/location-service.js'; // To check location ownership
import { MajorInspectionService } from '../services/major-inspection-service.js';
import httpStatus from 'http-status';
import { CustomError } from '../middleware/errorHandler.js';
import { ParamsDictionary } from 'express-serve-static-core';

// interface LocationParams extends ParamsDictionary {
//   locationId: string;
// }

/**
 * Middleware factory that accepts an instance of LocationService via Dependency Injection.
 * It returns the actual Express middleware function which checks if the authenticated user
 * owns the resource specified by :locationId.
 *
 * @param locationService An instance of the LocationService used to perform the check.
 * @returns The Express middleware function to be used in routes.
 */
const checkLocationOwnership = (locationService: LocationService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const locationId = req.params.locationId as string;
      // req.currentUser is set by a preceding authentication middleware (like isAuthenticated)
      const userId = req.currentUser?.id;

      if (!userId) {
        // This should be caught by isAuthenticated, but is a necessary safety check
        const error = new Error('Authentication required for ownership check.') as CustomError;
        error.statusCode = httpStatus.UNAUTHORIZED; // 401
        throw error;
      }

      // Call the non-static instance method on the injected service
      const isOwner = await locationService.checkLocationOwnership(locationId, userId);

      if (!isOwner) {
        const error = new Error('Forbidden. You do not own this location.') as CustomError;
        error.statusCode = httpStatus.FORBIDDEN; // 403
        throw error;
      }

      // Ownership confirmed, proceed
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware factory that checks if the authenticated user owns a Major Inspection
 * via its associated Location.
 * * @param majorInspectionService An instance of the MajorInspectionService.
 * @returns The Express middleware function.
 */
export const checkMajorInspectionOwnership = (majorInspectionService: MajorInspectionService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const locationId = req.params.locationId as string;
      const majorInspectionId = req.params.majorInspectionId as string;
      const userId = req.currentUser?.id;

      if (!userId || !locationId || !majorInspectionId) {
        // If any ID is missing, something is wrong with the preceding middleware or routing.
        const error = new Error('Missing authentication or resource IDs.') as CustomError;
        error.statusCode = httpStatus.BAD_REQUEST; // 400
        throw error;
      }

      // --- 🔑 The Core Check (Service/Repository Delegation) ---
      // The MajorInspectionService should have a dedicated method for this.
      const isOwner = await majorInspectionService.checkMajorInspectionOwnership(majorInspectionId, locationId, userId);

      if (!isOwner) {
        const error = new Error('Forbidden. You do not own this Major Inspection or it does not exist.') as CustomError;
        error.statusCode = httpStatus.FORBIDDEN; // 403
        throw error;
      }

      // Ownership confirmed. Proceed to the Controller.
      next();
    } catch (error) {
      // Forward error to Express error handler middleware
      next(error);
    }
  };
};

export { checkLocationOwnership };
