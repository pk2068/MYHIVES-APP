// src/controllers/hiveInspectionController.ts

import { Request, Response, NextFunction } from 'express';
import { HiveInspectionService } from '../services/hiveInspectionService';
import { MajorInspectionService } from '../services/majorInspectionService'; // Needed for ownership check
import { CreateHiveInspectionDto, UpdateHiveInspectionDto } from '../types/dtos';
import { CustomRequest } from '../types/custom-request'; // Assuming you have a CustomRequest type for req.user
//import { ApiError } from '../utils/ApiError';
import { CustomError } from '../middleware/errorHandler';
import httpStatus from 'http-status';

export class HiveInspectionController {

  // POST /api/locations/:locationId/major-inspections/:majorInspectionId/hive-inspections
  public static async createHiveInspection(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { locationId, majorInspectionId } = req.params;
      const userId = req.user!.id; // Authenticated user ID

      // 1. Verify ownership of the Major Inspection to the user and location
      const majorInspection = await MajorInspectionService.getMajorInspectionById(
        majorInspectionId, locationId, userId);
      if (!majorInspection) {        
        const _err = new Error('Major inspection not found or not owned by user in this location.') as CustomError;
        _err.statusCode = httpStatus.NOT_FOUND;
        throw _err;
      }

      // 2. Validate request body against DTO (Joi validation middleware should ideally do this before this point)
      const hiveData: CreateHiveInspectionDto = { ...req.body, majorInspectionId: majorInspectionId }; // Ensure majorInspectionId from param is used

      // 3. Create the Hive Inspection
      const newHiveInspection = await HiveInspectionService.createHiveInspection(
        majorInspectionId,
        hiveData
      );

      res.status(httpStatus.CREATED).send(newHiveInspection);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/locations/:locationId/major-inspections/:majorInspectionId/hive-inspections
  public static async getHiveInspectionsByMajorInspectionId(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { locationId, majorInspectionId } = req.params;
      const userId = req.user!.id;

      // Verify ownership of the Major Inspection
      const majorInspection = await MajorInspectionService.getMajorInspectionById(majorInspectionId, locationId, userId);
      if (!majorInspection) {        
        const _err = new Error('Major inspection not found or not owned by user in this location.') as CustomError;
        _err.statusCode = httpStatus.NOT_FOUND;
        throw _err;
      }

      const hiveInspections = await HiveInspectionService.getHiveInspectionsByMajorInspectionId(majorInspectionId);

      res.status(httpStatus.OK).send(hiveInspections);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/locations/:locationId/major-inspections/:majorInspectionId/hive-inspections/:hiveInspectionId
  public static async getHiveInspectionById(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { locationId, majorInspectionId, hiveInspectionId } = req.params;
      const userId = req.user!.id;

      // Verify ownership of the Major Inspection
      const majorInspection = await MajorInspectionService.getMajorInspectionById(majorInspectionId, locationId, userId);
      if (!majorInspection) {        
        const _err = new Error('Major inspection not found or not owned by user in this location.') as CustomError;
        _err.statusCode = httpStatus.NOT_FOUND;
        throw _err;
      }

      const hiveInspection = await HiveInspectionService.getHiveInspectionById(hiveInspectionId, majorInspectionId);
      if (!hiveInspection) {
        const _err = new Error('Hive inspection not found under this major inspection.') as CustomError;
        _err.statusCode = httpStatus.NOT_FOUND;
        throw _err;
      }

      res.status(httpStatus.OK).send(hiveInspection);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/locations/:locationId/major-inspections/:majorInspectionId/hive-inspections/:hiveInspectionId
  public static async updateHiveInspection(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { locationId, majorInspectionId, hiveInspectionId } = req.params;
      const userId = req.user!.id;

      // Verify ownership of the Major Inspection
      const majorInspection = await MajorInspectionService.getMajorInspectionById(majorInspectionId, locationId, userId);
      if (!majorInspection) {
        const _err = new Error('Major inspection not found or not owned by user in this location.') as CustomError;
        _err.statusCode = httpStatus.NOT_FOUND;
        throw _err;
      }

      const updateData: UpdateHiveInspectionDto = req.body; // Joi validation should ensure valid partial data

      const updatedHiveInspection = await HiveInspectionService.updateHiveInspection(
        hiveInspectionId,
        majorInspectionId,
        updateData
      );

      if (!updatedHiveInspection) {        
         const _err = new Error('Hive inspection not found or could not be updated.') as CustomError;
         _err.statusCode = httpStatus.NOT_FOUND;  
         throw _err;

      }

      res.status(httpStatus.OK).send(updatedHiveInspection);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/locations/:locationId/major-inspections/:majorInspectionId/hive-inspections/:hiveInspectionId
  public static async deleteHiveInspection(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { locationId, majorInspectionId, hiveInspectionId } = req.params;
      const userId = req.user!.id;

      // Verify ownership of the Major Inspection
      const majorInspection = await MajorInspectionService.getMajorInspectionById(majorInspectionId, locationId, userId);
      if (!majorInspection) {        
         const _err = new Error('Major inspection not found or not owned by user in this location.') as CustomError;
        _err.statusCode = httpStatus.NOT_FOUND;
         throw _err;  

      }

      const deleted = await HiveInspectionService.deleteHiveInspection(hiveInspectionId, majorInspectionId);

      if (!deleted) {
        const _err = new Error('Hive inspection not found or could not be deleted.') as CustomError;
        _err.statusCode = httpStatus.NOT_FOUND;
        throw _err;
      }

      res.status(httpStatus.NO_CONTENT).send(); // 204 No Content for successful deletion
    } catch (error) {
      next(error);
    }
  }
}