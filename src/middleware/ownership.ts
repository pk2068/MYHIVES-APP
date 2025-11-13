import { Request, Response, NextFunction } from 'express';
import { LocationService } from '../services/location-service.js'; // To check location ownership
import { MajorInspectionService } from '../services/major-inspection-service.js';
import httpStatus from 'http-status';
import { CustomError } from '../middleware/errorHandler.js';
import { ParamsDictionary } from 'express-serve-static-core';

interface LocationParams extends ParamsDictionary {
  locationId: string;
}

// Middleware to ensure location belongs to the authenticated user
// Goal is to check if the :majorInspectionId in the URL param belongs to the authenticated user
// This assumes MajorInspectionService has a method to verify ownership without requiring locationId in URL
const checkMajorInspectionOwnershipForHive = async (req: Request, res: Response, next: NextFunction) => {
  // console.log('Checking major inspection ownership for hive inspections...', req.params, req.body, req.currentUser);
  try {
    const { majorInspectionId, locationId } = req.params;
    const userId = req.currentUser!.id;

    // IMPORTANT: You need to implement this method in your MajorInspectionService.
    // It should fetch the major inspection and ensure its associated location's userId matches the current user.
    //const majorInspectionOwned = await MajorInspectionService.getMajorInspectionByIdAndVerifyUser(
    // console.log(
    //   '\t\t @Ownership/checkMajorInspectionOwnershipForHive Checking major inspection ownership for hive inspections...',
    //   '\nmajorInspectionId:',
    //   majorInspectionId,
    //   '\nlocationId:',
    //   locationId,
    //   '\nuserId:',
    //   userId
    // );

    const majorInspectionOwned = await MajorInspectionService.getMajorInspectionById(userId, majorInspectionId, locationId);

    if (!majorInspectionOwned) {
      const error: CustomError = new Error('oMajor Inspection not found or not owned by user') as CustomError;
      error.statusCode = httpStatus.NOT_FOUND; // 404
      throw error;
    }

    // Store the fetched object on res.locals for subsequent handlers
    res.locals.majorInspectionOwned = majorInspectionOwned;
    //console.log('%%% Major Inspection ownership verified for hive:', res.locals.majorInspectionOwned);

    next();
  } catch (error) {
    console.error('%%% Error checking major inspection ownership for hive:', error);
    next(error);
  }
};

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

export { checkLocationOwnership, checkMajorInspectionOwnershipForHive };
