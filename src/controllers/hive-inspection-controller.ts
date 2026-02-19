// src/controllers/hiveInspectionController.ts

import { Response, NextFunction } from 'express';
import { CustomRequest } from '../types/DTO/per-controller/custom-request.js';
import { HiveInspectionService } from '../services/hive-inspection-service.js';

import { HiveInspectionServiceCreateDTO, HiveInspectionServiceRetrievedDTO, HiveInspectionServiceUpdateDTO } from '../services/dto/hive-inspection-service.dto.js';

import { CustomError } from '../middleware/errorHandler.js';
import httpStatus from 'http-status';
import { major_inspectionsAttributes } from '../database/models-ts/major-inspections.js';
import { UniqueConstraintError } from 'sequelize';

export class HiveInspectionController {
  private _hiveInspectionService: HiveInspectionService;

  constructor(hiveInspectionService: HiveInspectionService) {
    this._hiveInspectionService = hiveInspectionService;
  }

  // ------------------------------------------------------------------
  // POST /api/locations/:locationId/major-inspections/:majorInspectionId/hive-inspections
  // ------------------------------------------------------------------
  public async createHiveInspection(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    console.log('Controller: Creating hive inspection');
    try {
      const { majorInspectionId } = req.params;

      // 2. Validate request body against DTO (Joi validation middleware should ideally do this before this point)
      const hiveData: HiveInspectionServiceCreateDTO = { ...req.body, major_inspection_id: majorInspectionId }; // Ensure majorInspectionId from param is used
      console.log('Hive inspection data to be created:', hiveData);

      // 3. Create the Hive Inspection
      const newHiveInspection = await this._hiveInspectionService.createHiveInspection(hiveData);
      console.log('Controller: New hive inspection created on database:', newHiveInspection);

      res.status(httpStatus.CREATED).json(newHiveInspection);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        // <-- Check for the specific error
        // A specific hive should only be inspected once per major inspection event
        const _err = new Error('A hive inspection for this hive already exists in this major inspection.') as CustomError;
        _err.statusCode = httpStatus.CONFLICT; // Return 409 Conflict
        next(_err);
      } else {
        next(error);
      }
    }
  }

  // ------------------------------------------------------------------
  // GET /api/locations/:locationId/major-inspections/:majorInspectionId/hive-inspections
  // ------------------------------------------------------------------
  public async getHiveInspectionsByMajorInspectionId(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { locationId, majorInspectionId } = req.params as { locationId: string; majorInspectionId: string };
      const userId = req.currentUser!.id;

      // Call the secure service method
      const inspections: HiveInspectionServiceRetrievedDTO[] | null = await this._hiveInspectionService.getHiveInspectionsByMajorInspectionId(
        majorInspectionId,
        locationId,
        userId
      );

      if (!inspections) {
        // Security Gate: If the Major Inspection is not owned by the user/location,
        // return 404 Not Found to prevent leaking resource existence.
        res.status(httpStatus.NOT_FOUND).json({
          message: 'Major inspection not found or access denied.',
        });
        return;
      }

      res.status(httpStatus.OK).json({
        message: 'Hive inspections retrieved successfully.',
        hive_inspections: inspections,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/locations/:locationId/major-inspections/:majorInspectionId/hive-inspections/:hiveInspectionId
  public async getHiveInspectionById(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { majorInspectionId, hiveInspectionId } = req.params;

      const hiveInspection = await this._hiveInspectionService.getHiveInspectionById(hiveInspectionId as string, majorInspectionId as string);
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
  public async updateHiveInspection(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { locationId, majorInspectionId, hiveInspectionId } = req.params as { [key: string]: string };
      const userId = req.currentUser!.id;

      // Access the object directly from res.locals, no new DB query needed

      const majorInspection = res.locals.majorInspectionOwned as major_inspectionsAttributes;
      if (!majorInspection) {
        const _err = new Error('Major inspection not found or not owned by user in this location.') as CustomError;
        _err.statusCode = httpStatus.FORBIDDEN;
        throw _err;
      }

      const hiveId = req.body.hiveId as string;
      const updateData: HiveInspectionServiceUpdateDTO = req.body; // Joi validation should ensure valid partial data

      //console.log('------------------ Controller: Updating hive inspection with data:', updateData);

      const updatedHiveInspection = await this._hiveInspectionService.updateHiveInspection(hiveInspectionId, updateData);

      //console.log('------------------ Controller: Updated hive inspection:', updatedHiveInspection);

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
  public async deleteHiveInspection(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { locationId, majorInspectionId, hiveInspectionId } = req.params as { [key: string]: string };
      const userId = req.currentUser!.id;
      const hiveId = req.body.hiveId as string;

      const deleted = await this._hiveInspectionService.deleteHiveInspection(hiveInspectionId, majorInspectionId, locationId, userId);

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

  // GET /api/locations/:locationId/hives/:hiveId/hive-inspections/history
  public async getHiveInspectionHistory(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { locationId, hiveId } = req.params as { locationId: string; hiveId: string };
      const userId = req.currentUser!.id;

      const hiveInspectionHistory = await this._hiveInspectionService.getHiveInspectionHistory(hiveId, locationId, userId);

      res.status(httpStatus.OK).send(hiveInspectionHistory);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/locations/:locationId/hives/:hiveId/hive-inspections/history?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
  public async getHiveInspectionHistoryByDateRange(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { locationId, hiveId } = req.params as { locationId: string; hiveId: string };
      const userId = req.currentUser!.id;
      const { startDate, endDate } = req.query as { startDate: string; endDate?: string };

      const hiveInspectionHistoryByDateRange = await this._hiveInspectionService.getHiveInspectionHistoryByDateRange(hiveId, startDate, endDate);

      res.status(httpStatus.OK).send(hiveInspectionHistoryByDateRange);
    } catch (error) {
      next(error);
    }
  }
}

// TODO : This controller is finished ... update the router accordingly so that i calls the ownership middleware where the hiveInspectionId is known!!!!!!aaavg
