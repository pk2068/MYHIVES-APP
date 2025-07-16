import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../middleware/errorHandler.js';
import { LocationService } from '../services/locationService.js'; // Import the service
import { locationsAttributes } from 'database/models-ts/locations.js';
//import { Location as LocationInterface } from '../types/models.js'; // Import the interface
// import { Location as LocationInterface } from '../types/models'; // No longer needed for this specific line
//import { CreateLocationDto } from '../types/dtos.js'; // <-- IMPORT THE NEW DTO

export const createLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.currentUser!.id; // Authenticate middleware ensures req.user.id exists
    const locationData: locationsAttributes = req.body;

    const newLocation = await LocationService.createLocation(userId, locationData);

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: newLocation,
    });
  } catch (error) {
    next(error);
  }
};

export const getLocations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.currentUser!.id;

    const locations = await LocationService.getLocationsByUserId(userId);

    res.status(200).json({
      success: true,
      data: locations,
    });
  } catch (error) {
    next(error);
  }
};

export const getLocationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.currentUser!.id;
    const { id } = req.params;

    const location = await LocationService.getLocationById(id, userId);

    if (!location) {
      const error = new Error('Location not found or unauthorized.') as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.currentUser!.id;
    const { id } = req.params;
    const updateData: Partial<locationsAttributes> = req.body;

    const updatedLocation = await LocationService.updateLocation(id, userId, updateData);

    if (!updatedLocation) {
      const error = new Error('Location not found or unauthorized.') as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: updatedLocation,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.currentUser!.id;
    const { id } = req.params;

    const deleted = await LocationService.deleteLocation(id, userId);

    if (!deleted) {
      const error = new Error('Location not found or unauthorized.') as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Location deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMapData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This endpoint retrieves data for the map view.
    // It should ideally not require authentication if it's meant to show *all* locations to *any* user.
    // If it's only for logged-in users, keep authenticate middleware.
    // For showing "all registered beehive locations within a country" with owner email/username,
    // it might require a join query to get hive counts and owner info across all users.

    // For simplicity, let's just return a placeholder or mock data for now.
    // A real implementation would involve a more complex query involving Users, Locations, and Major/Hive Inspections
    // to aggregate hive counts per location.
    const mockMapData = [
      {
        id: 'loc1',
        latitude: 46.0569, // Ljubljana, Slovenia
        longitude: 14.5058,
        hiveCount: 12,
        ownerUsername: 'SlovenianBeekeeper',
      },
      {
        id: 'loc2',
        latitude: 46.5547, // Maribor, Slovenia
        longitude: 15.6459,
        hiveCount: 8,
        ownerUsername: 'ApiaryExplorer',
      },
    ];

    res.status(200).json({
      success: true,
      data: mockMapData,
    });
  } catch (error) {
    next(error);
  }
};
