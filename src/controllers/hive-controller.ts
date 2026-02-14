import { Request, Response, NextFunction } from 'express';
import { HiveService } from '../services/hive-service.js';
import { CustomError } from '../middleware/errorHandler.js';
import { HiveServiceCreateDTO, HiveServiceRetrievedDTO, HiveServiceUpdateDTO } from 'services/dto/hive-service.dto.js';

export class HiveController {
  private _hiveService: HiveService;

  constructor(hiveService: HiveService) {
    this._hiveService = hiveService;
  }

  // Get all hives
  public getAllHives = async (req: Request, res: Response, next: NextFunction) => {
    try {
      //console.log('Controller : Fetching hives...', req.params);

      const location_id = req.params.locationId as string;

      const hives = await this._hiveService.getHivesByLocationId(location_id);

      res.status(200).json({
        success: true,
        message: 'Hives fetched successfully',
        data: hives,
      });
    } catch (error) {
      //res.status(500).json({ error: 'Failed to fetch hives' });
      next(error);
    }
  };

  // Get hive by ID
  public getHiveById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      //console.log('Controller : Fetching hive...', req.params);

      const location_id = req.params.locationId as string;
      const hive_id = req.params.hive_id as string;

      const hive: HiveServiceRetrievedDTO | null = await this._hiveService.getHiveById(location_id, hive_id);

      if (!hive) {
        const error = new Error('Hive not found.') as CustomError;
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        success: true,
        message: 'Hive fetched successfully',
        data: hive,
      });
    } catch (error) {
      next(error);
    }
  };

  public createHive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      //console.log('Creating hive...', req.params.locationId, req.body);
      const location_id = req.params.locationId;
      const hiveBodyData = req.body;

      const hiveData: HiveServiceCreateDTO = { ...hiveBodyData, locationId: location_id };

      console.log('Hive data:', hiveData);

      const newHiveCreated = await this._hiveService.createHive(hiveData);

      res.status(201).json(newHiveCreated);
    } catch (error) {
      next(error);
    }
  };

  // Update a hive
  public updateHive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const location_id = req.params.locationId as string;
      const hive_id = req.params.hive_id as string;
      const updatedHiveData = req.body;
      const updateHivePayload: HiveServiceUpdateDTO = { ...updatedHiveData, location_id: location_id };

      const updatedHive = await this._hiveService.updateHive(hive_id, updateHivePayload);
      if (!updatedHive) {
        const error = new Error('Hive not found.') as CustomError;
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({
        success: true,
        message: 'Hive updated successfully',
        data: updatedHive,
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete a hive
  public deleteHive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const location_id = req.params.locationId as string;
      const hive_id = req.params.hive_id as string;

      console.log('Controller : Deleting hive...', req.params);

      const deleted = await this._hiveService.deleteHive(location_id, hive_id);
      if (!deleted) {
        const error = new Error('Hive not found.') as CustomError;
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({
        success: true,
        message: 'Hive deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteAllHives = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const location_id: string = req.params.location_id as string;

      const deleted = await this._hiveService.deleteAllHives(location_id);
      if (!deleted) {
        const error = new Error('Hives not deleted.') as CustomError;
        error.statusCode = 404;
        throw error;
      }
      res.json({ message: 'Hives deleted successfully', success: true });
    } catch (error) {
      next(error);
    }
  };
} // end of class HiveController

// export default {
//   getAllHives,
//   getHiveById,
//   createHive,
//   updateHive,
//   deleteHive,
//   deleteAllHives,
// };
