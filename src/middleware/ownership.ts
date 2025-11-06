import { Request, Response, NextFunction } from 'express';
import { LocationService } from '../services/location-service.js'; // To check location ownership
import { MajorInspectionService } from '../services/major-inspection-service.js';
import httpStatus from 'http-status';
import { CustomError } from '../middleware/errorHandler.js';

// Middleware to ensure location belongs to the authenticated user
const checkLocationOwnership = async (req: Request, res: Response, next: NextFunction) => {
  //console.log('Checking location ownership...', req.params, req.body, req.currentUser);
  try {
    const userId = req.currentUser!.id;
    const { locationId } = req.params;

    const location: boolean = await LocationService.checkLocationOwnership(locationId, userId);
    if (!location) {
      const error = new Error('Location not found or unauthorized.') as CustomError;
      error.statusCode = httpStatus.FORBIDDEN; // 403
      throw error;
    }
    next(); // Location is owned by the user, proceed
  } catch (error) {
    next(error);
  }
};

// Middleware to check if the :majorInspectionId in the URL param belongs to the authenticated user
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

export { checkLocationOwnership, checkMajorInspectionOwnershipForHive };
