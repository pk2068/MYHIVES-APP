// src/controllers/hiveInspectionController.ts

import { Response, NextFunction } from 'express';
import { CustomRequest } from '../types/custom-request.js';
import { HiveInspectionService } from '../services/hiveInspectionService.js';
import { MajorInspectionService } from '../services/majorInspectionService.js'; // Needed for ownership check
import { hive_inspectionsAttributes } from 'database/models-ts/hive_inspections.js';

//import { CreateHiveInspectionDto, UpdateHiveInspectionDto } from '../types/dtos.js';

//import { ApiError } from '../utils/ApiError';
import { CustomError } from '../middleware/errorHandler.js';
import httpStatus from 'http-status';
import { major_inspectionsAttributes } from '../database/models-ts/major_inspections.js';

export class HiveInspectionController {
  // POST /api/locations/:locationId/major-inspections/:majorInspectionId/hive-inspections
  public static async createHiveInspection(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    console.log('Controller: Creating hive inspection');
    try {
      const { locationId, majorInspectionId } = req.params;
      const userId = req.currentUser!.id; // Authenticated user ID

      // Access the object directly from res.locals, no new DB query needed
      console.log('%%% Major Inspection ownership verified for hive:', res.locals.majorInspection);
      const majorInspection = res.locals.majorInspectionOwned as major_inspectionsAttributes;
      //const majorInspection = await MajorInspectionService.getMajorInspectionById(userId, majorInspectionId, locationId);
      if (!majorInspection) {
        const _err = new Error('hicMajor inspection not found or not owned by user in this location.') as CustomError;
        _err.statusCode = httpStatus.NOT_FOUND;
        throw _err;
      }
      console.log('Controller: Major inspection ownership verified:', majorInspection);

      // 2. Validate request body against DTO (Joi validation middleware should ideally do this before this point)
      const hiveData: hive_inspectionsAttributes = { ...req.body, major_inspection_id: majorInspectionId }; // Ensure majorInspectionId from param is used
      console.log('Hive inspection data to be created:', hiveData);

      // 3. Create the Hive Inspection
      const newHiveInspection = await HiveInspectionService.createHiveInspection(hiveData);
      console.log('Controller: New hive inspection created on database:', newHiveInspection);

      res.status(httpStatus.CREATED).send(newHiveInspection);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/locations/:locationId/major-inspections/:majorInspectionId/hive-inspections
  public static async getHiveInspectionsByMajorInspectionId(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    console.log('-------------------+++++++++++++++++++++++++++++----------------');
    try {
      const { locationId, majorInspectionId } = req.params;
      const userId = req.currentUser!.id;

      // Access the object directly from res.locals, no new DB query needed
      console.log('%%% Major Inspection ownership verified for hive:', res.locals.majorInspection);
      const majorInspection = res.locals.majorInspectionOwned as major_inspectionsAttributes;
      //const majorInspection = await MajorInspectionService.getMajorInspectionById(userId, majorInspectionId, locationId);

      if (!majorInspection) {
        const _err = new Error('hicMajor inspection Not found or not owned by user in this location.') as CustomError;
        _err.statusCode = httpStatus.NOT_FOUND;
        throw _err;
      }

      console.log('A1 ++++++ :', majorInspection);
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
      const userId = req.currentUser!.id;

      // Access the object directly from res.locals, no new DB query needed
      console.log('%%% Major Inspection ownership verified for hive:', res.locals.majorInspection);
      const majorInspection = res.locals.majorInspectionOwned as major_inspectionsAttributes;
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
      const userId = req.currentUser!.id;

      // Access the object directly from res.locals, no new DB query needed
      console.log('%%% Major Inspection ownership verified for hive:', res.locals.majorInspection);
      const majorInspection = res.locals.majorInspectionOwned as major_inspectionsAttributes;
      if (!majorInspection) {
        const _err = new Error('hicMajor inspection not found or not owned by user in this location.') as CustomError;
        _err.statusCode = httpStatus.NOT_FOUND;
        throw _err;
      }

      const updateData: hive_inspectionsAttributes = req.body; // Joi validation should ensure valid partial data

      const updatedHiveInspection = await HiveInspectionService.updateHiveInspection(hiveInspectionId, majorInspectionId, updateData);

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
      const userId = req.currentUser!.id;

      // Access the object directly from res.locals, no new DB query needed
      console.log('%%% Major Inspection ownership verified for hive:', res.locals.majorInspection);
      const majorInspection = res.locals.majorInspectionOwned as major_inspectionsAttributes;
      if (!majorInspection) {
        const _err = new Error('hicMajor inspection not found or not owned by user in this location.') as CustomError;
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
