// src/routes/hiveInspectionRoutes.ts

import { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { HiveInspectionService } from '../services/hiveInspectionService';
import { MajorInspectionService } from '../services/majorInspectionService'; // Needed for ownership checks
import { isAuthenticated } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { CreateHiveInspectionDto, UpdateHiveInspectionDto } from '../types/dtos';
import { CustomError } from '../middleware/errorHandler';
import '../types/custom-request';

// Assuming these enums are defined in your models/types
import {
  ColonyHealthStatus,
  QueenStatus,
  TreatmentApplied,
  QueenCellStatus,
} from '../types/models';

const hiveInspectionRouter = Router();

// --- Joi Schemas for HiveInspection ---
const beehiveConfigurationSchema = Joi.object({
  type: Joi.string().required(),
  numberOfFrames: Joi.number().integer().min(1).required(),
  materials: Joi.array().items(Joi.string()).optional(),
  isInsulated: Joi.boolean().optional(),
});

const createHiveInspectionSchema = Joi.object<CreateHiveInspectionDto>({
  // majorInspectionId will come from params, and is required for the service call,
  // but Joi might pick it up from the merged body. Make it optional in the body schema itself.
  hiveNumber: Joi.string().trim().required(),
  inspectionHour: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
    'string.pattern.base': 'Inspection hour must be in HH:MM format (e.g., 14:30)'
  }),
  colonyHealthStatus: Joi.string().valid(...Object.values(ColonyHealthStatus)).required(),
  numberOfChambers: Joi.number().integer().min(1).required(),
  amountOfBrood: Joi.string().required(),
  queenStatus: Joi.string().valid(...Object.values(QueenStatus)).required(),
  approximateAmountOfHoney: Joi.string().required(),
  amountOfDroneComb: Joi.string().required(),
  sugarFeedAdded: Joi.boolean().required(),
  sugarFeedQuantity: Joi.string().allow(null, '').optional(),
  beehiveConfiguration: beehiveConfigurationSchema.required(),
  numberOfVarroaMitesFound: Joi.number().integer().min(0).required(),
  varroaTreatment: Joi.boolean().required(),
  treatmentApplied: Joi.string().valid(...Object.values(TreatmentApplied)).allow(null).optional(),
  dosageAmount: Joi.string().allow(null, '').optional(),
  raisingNewQueen: Joi.boolean().required(),
  queenCellAge: Joi.number().integer().min(0).allow(null).optional(),
  queenCellStatus: Joi.string().valid(...Object.values(QueenCellStatus)).allow(null).optional(),
  otherNotes: Joi.string().trim().max(1000).allow(null, '').optional(),
});

// All fields optional for update
const updateHiveInspectionSchema = Joi.object<UpdateHiveInspectionDto>({
  hiveNumber: Joi.string().trim().optional(),
  inspectionHour: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().messages({
    'string.pattern.base': 'Inspection hour must be in HH:MM format (e.g., 14:30)'
  }),
  colonyHealthStatus: Joi.string().valid(...Object.values(ColonyHealthStatus)).optional(),
  numberOfChambers: Joi.number().integer().min(1).optional(),
  amountOfBrood: Joi.string().optional(),
  queenStatus: Joi.string().valid(...Object.values(QueenStatus)).optional(),
  approximateAmountOfHoney: Joi.string().optional(),
  amountOfDroneComb: Joi.string().optional(),
  sugarFeedAdded: Joi.boolean().optional(),
  sugarFeedQuantity: Joi.string().allow(null, '').optional(),
  beehiveConfiguration: beehiveConfigurationSchema.optional(),
  numberOfVarroaMitesFound: Joi.number().integer().min(0).optional(),
  varroaTreatment: Joi.boolean().optional(),
  treatmentApplied: Joi.string().valid(...Object.values(TreatmentApplied)).allow(null).optional(),
  dosageAmount: Joi.string().allow(null, '').optional(),
  raisingNewQueen: Joi.boolean().optional(),
  queenCellAge: Joi.number().integer().min(0).allow(null).optional(),
  queenCellStatus: Joi.string().valid(...Object.values(QueenCellStatus)).allow(null).optional(),
  otherNotes: Joi.string().trim().max(1000).allow(null, '').optional(),
});

const hiveInspectionParamsSchema = Joi.object({
  majorInspectionId: Joi.string().guid({ version: ['uuidv4'] }).required(),
  hiveInspectionId: Joi.string().guid({ version: ['uuidv4'] }).required(),
});

// Middleware to check if the :majorInspectionId in the URL param belongs to the authenticated user
// This assumes MajorInspectionService has a method to verify ownership without requiring locationId in URL
const checkMajorInspectionOwnershipForHive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { majorInspectionId } = req.params;
    const userId = req.user!.id;

    // IMPORTANT: You need to implement this method in your MajorInspectionService.
    // It should fetch the major inspection and ensure its associated location's userId matches the current user.
    const majorInspectionOwned = await MajorInspectionService.getMajorInspectionByIdAndVerifyUser(
      majorInspectionId,
      userId
    );

    if (!majorInspectionOwned) {
      const error: CustomError = new Error('Major Inspection not found or not owned by user');
      error.statusCode = 404;
      throw error;
    }
    next();
  } catch (error) {
    next(error);
  }
};


// POST /api/major-inspections/:majorInspectionId/hive-inspections - Create a hive inspection
hiveInspectionRouter.post(
  '/major-inspections/:majorInspectionId/hive-inspections',
  isAuthenticated,
  validate({
    params: Joi.object({ majorInspectionId: Joi.string().guid({ version: ['uuidv4'] }).required() }),
    body: createHiveInspectionSchema
  }),
  checkMajorInspectionOwnershipForHive, // Verify parent MajorInspection ownership
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { majorInspectionId } = req.params;
      // Merge majorInspectionId from URL into the DTO for service call
      const hiveData: CreateHiveInspectionDto = { ...req.body, majorInspectionId };

      const newHiveInspection = await HiveInspectionService.createHiveInspection(majorInspectionId, hiveData);
      res.status(201).json(newHiveInspection);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/major-inspections/:majorInspectionId/hive-inspections - Get all hive inspections
hiveInspectionRouter.get(
  '/major-inspections/:majorInspectionId/hive-inspections',
  isAuthenticated,
  validate({ params: Joi.object({ majorInspectionId: Joi.string().guid({ version: ['uuidv4'] }).required() }) }),
  checkMajorInspectionOwnershipForHive,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { majorInspectionId } = req.params;
      const hiveInspections = await HiveInspectionService.getHiveInspectionsByMajorInspectionId(majorInspectionId);
      res.status(200).json(hiveInspections);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/major-inspections/:majorInspectionId/hive-inspections/:hiveInspectionId - Get a specific hive inspection
hiveInspectionRouter.get(
  '/major-inspections/:majorInspectionId/hive-inspections/:hiveInspectionId',
  isAuthenticated,
  validate({ params: hiveInspectionParamsSchema }),
  checkMajorInspectionOwnershipForHive,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { majorInspectionId, hiveInspectionId } = req.params;
      const hiveInspection = await HiveInspectionService.getHiveInspectionById(hiveInspectionId, majorInspectionId);

      if (!hiveInspection) {
        const error: CustomError = new Error('Hive Inspection not found or not part of specified major inspection');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json(hiveInspection);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/major-inspections/:majorInspectionId/hive-inspections/:hiveInspectionId - Update a specific hive inspection
hiveInspectionRouter.put(
  '/major-inspections/:majorInspectionId/hive-inspections/:hiveInspectionId',
  isAuthenticated,
  validate({ params: hiveInspectionParamsSchema, body: updateHiveInspectionSchema }),
  checkMajorInspectionOwnershipForHive,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { majorInspectionId, hiveInspectionId } = req.params;
      const updateData: UpdateHiveInspectionDto = req.body;

      const updatedHiveInspection = await HiveInspectionService.updateHiveInspection(
        hiveInspectionId,
        majorInspectionId,
        updateData
      );

      if (!updatedHiveInspection) {
        const error: CustomError = new Error('Hive Inspection not found or not part of specified major inspection');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json(updatedHiveInspection);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/major-inspections/:majorInspectionId/hive-inspections/:hiveInspectionId - Delete a specific hive inspection
hiveInspectionRouter.delete(
  '/major-inspections/:majorInspectionId/hive-inspections/:hiveInspectionId',
  isAuthenticated,
  validate({ params: hiveInspectionParamsSchema }),
  checkMajorInspectionOwnershipForHive,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { majorInspectionId, hiveInspectionId } = req.params;
      const success = await HiveInspectionService.deleteHiveInspection(
        hiveInspectionId,
        majorInspectionId
      );

      if (!success) {
        const error: CustomError = new Error('Hive Inspection not found or not part of specified major inspection');
        error.statusCode = 404;
        throw error;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default hiveInspectionRouter;