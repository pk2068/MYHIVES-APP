// src/controllers/majorInspectionController.ts

import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../middleware/errorHandler.js';
import { MajorInspectionService } from '../services/major-inspection-service.js';
import { LocationService } from '../services/location-service.js'; // To check locat
import { MajorInspectionServiceRetrievedDTO, MajorInspectionServiceCreateDTO, MajorInspectionServiceUpdateDTO } from 'services/dto/major-inspection-service.dto.js';

export class MajorInspectionController {
  private readonly _majorInspectionService: MajorInspectionService;

  constructor(majorInspectionService: MajorInspectionService) {
    this._majorInspectionService = majorInspectionService;
  }

  public createMajorInspection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('Creating major inspection...ABCD', req.params, req.body);
      const { locationId } = req.params;

      const myData: MajorInspectionServiceCreateDTO = {
        location_id: locationId,
        ...req.body,
      };

      const newMajorInspection = await this._majorInspectionService.createMajorInspection(myData);
      res.status(201).json({
        success: true,
        message: 'Major inspection created successfully',
        data: newMajorInspection,
      });
    } catch (error) {
      next(error);
    }
  };

  //public async getMajorInspections(req: Request, res: Response, next: NextFunction) {
  public getMajorInspections = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('Fetching major inspections...');
      const { locationId } = req.params as { [key: string]: string };
      const majorInspections = await this._majorInspectionService.getMajorInspectionsByLocationId(locationId);
      res.status(200).json({
        success: true,
        data: majorInspections,
      });
    } catch (error) {
      next(error);
    }
  };

  public getSpecificMajorInspectionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { majorInspectionId, locationId } = req.params as { [key: string]: string };

      const majorInspection = await this._majorInspectionService.getMajorInspectionById(majorInspectionId, locationId);

      if (!majorInspection) {
        const error = new Error('cMajor inspection not found.') as CustomError;
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({
        success: true,
        data: majorInspection,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateMajorInspection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { majorInspectionId, locationId } = req.params as { [key: string]: string };
      const updateData: MajorInspectionServiceUpdateDTO = { ...req.body, location_id: locationId };
      console.log('Updating major inspection controller...', majorInspectionId, locationId, updateData);
      const updatedMajorInspection = await this._majorInspectionService.updateMajorInspection(majorInspectionId, updateData);

      if (!updatedMajorInspection) {
        const error = new Error('cMajor inspection not found.') as CustomError;
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({
        success: true,
        message: 'Major inspection updated successfully',
        data: updatedMajorInspection,
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteMajorInspection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { majorInspectionId, locationId } = req.params as { [key: string]: string };
      const userId = req.currentUser!.id;
      const deleted = await this._majorInspectionService.deleteMajorInspection(locationId, majorInspectionId, userId);

      if (!deleted) {
        const error = new Error('cMajor inspection not found.') as CustomError;
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        success: true,
        message: 'Major inspection deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // end of class
}
