import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../middleware/errorHandler.js';
import { LocationService } from '../services/location-service.js'; // Import the service
import { LocationControllerOutputDTO, LocationControllerListOutputDTO, LocationControllerCreateInputDTO, LocationControllerUpdateInputDTO } from './dto/location-controller.dto.js';
import { LocationServiceCreateDTO, LocationServiceRetrievedDTO, LocationServiceUpdateDTO } from '../services/dto/location-service.dto.js';
import { LocationServiceToControllerMapper } from '../utils/converters/location/service-to-controller.mapper.js';
import { LocationControllerToServiceMapper } from '../utils/converters/location/controller-to-service.mapper.js';
import httpStatus from 'http-status';

export class LocationController {
  private readonly _locationService: LocationService;

  constructor(locationService: LocationService) {
    this._locationService = locationService;
  }

  public createLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.currentUser || !req.currentUser.id) {
        const custErr = new Error('Authentication required.') as CustomError;
        custErr.statusCode = httpStatus.UNAUTHORIZED;
        throw custErr;
      }
      const userId = req.currentUser.id;
      const incomingData: LocationControllerCreateInputDTO = req.body; // from controller dto interface definition

      const serviceDataParam: LocationServiceCreateDTO = LocationControllerToServiceMapper.toServiceCreateDTO(incomingData, userId);

      const location: LocationServiceRetrievedDTO = await this._locationService.createLocation(serviceDataParam);

      const responseData: LocationControllerOutputDTO = LocationServiceToControllerMapper.toControllerOutputDTO(location, 'Location created successfully!', true);

      return res.status(httpStatus.CREATED).json(responseData);
    } catch (error) {
      return next(error);
    }
  };

  public getAllLocations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.currentUser || !req.currentUser.id) {
        const custErr = new Error('Authentication required.') as CustomError;
        custErr.statusCode = httpStatus.UNAUTHORIZED;
        throw custErr;
      }

      // we serve the GET method .... for "/" all locations for that user
      const locations: LocationServiceRetrievedDTO[] = await this._locationService.getAllLocationsByUserId(req.currentUser.id);

      const responseData: LocationControllerListOutputDTO = LocationServiceToControllerMapper.toControllerListOutputDTO(locations, 'Locations retrieved successfully!', true);

      return res.status(httpStatus.OK).json(responseData);
    } catch (error) {
      return next(error);
    }
  };

  public getLocationById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.currentUser || !req.currentUser.id) {
        const custErr = new Error('Authentication required.') as CustomError;
        custErr.statusCode = httpStatus.UNAUTHORIZED;
        throw custErr;
      }
      const userId = req.currentUser.id;
      const { locationId } = req.params;

      const specificLocation: LocationServiceRetrievedDTO | null = await this._locationService.getLocationById(locationId);

      if (!specificLocation) {
        const error = new Error('Location not found or unauthorized.') as CustomError;
        error.statusCode = 404;
        throw error;
      }

      const responseData: LocationControllerOutputDTO = LocationServiceToControllerMapper.toControllerOutputDTO(specificLocation, 'Location retrieved successfully!', true);

      return res.status(httpStatus.OK).json(responseData);
    } catch (error) {
      return next(error);
    }
  };

  public updateLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.currentUser || !req.currentUser.id) {
        const custErr = new Error('Authentication required.') as CustomError;
        custErr.statusCode = httpStatus.UNAUTHORIZED;
        throw custErr;
      }
      const userId = req.currentUser.id;
      const { locationId } = req.params;

      const updateDataRaw: LocationControllerUpdateInputDTO = req.body;

      const updateDataForService: LocationServiceUpdateDTO = LocationControllerToServiceMapper.toServiceUpdateDTO(updateDataRaw, userId);

      const updatedLocation: LocationServiceRetrievedDTO = await this._locationService.updateLocation(locationId, updateDataForService);

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

  public deleteLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.currentUser || !req.currentUser.id) {
        const custErr = new Error('Authentication required.') as CustomError;
        custErr.statusCode = httpStatus.UNAUTHORIZED;
        throw custErr;
      }

      const { locationId } = req.params;
      const deleted: number = await this._locationService.deleteLocation(locationId);

      if (deleted === 0) {
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

  public getMapData = async (req: Request, res: Response, next: NextFunction) => {
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
}
