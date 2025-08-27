import { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { HiveInspectionService } from '../services/hiveInspectionService.js';
//import { MajorInspectionService } from '../services/majorInspectionService.js'; // Needed for ownership checks
import { hive_inspectionsAttributes } from '../database/models-ts/hive_inspections.js';
import { isAuthenticated } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

import { checkMajorInspectionOwnershipForHive as checkMajorInspectionOwnership } from '../middleware/ownership.js';
// import { CreateHiveInspectionDto, UpdateHiveInspectionDto } from '../types/dtos.js';
import { CustomError } from '../middleware/errorHandler.js';
//import {CustomRequest} from '../types/custom-request.js';

// Assuming these enums are defined in your models/types
import { ColonyHealthStatus, QueenStatus, TreatmentApplied, QueenCellStatus } from '../types/models.js';
import { HiveInspectionController } from '../controllers/hiveInspectionController.js';

const hiveInspectionRouter = Router({ mergeParams: true });

// --- Joi Schemas for HiveInspection ---
// const beehiveConfigurationSchema = Joi.object({
//   type: Joi.string().required(),
//   numberOfFrames: Joi.number().integer().min(1).required(),
//   materials: Joi.array().items(Joi.string()).optional(),
//   isInsulated: Joi.boolean().optional(),
// });

const createHiveInspectionSchema = Joi.object({
  // majorInspectionId will come from params, and is required for the service call,
  // but Joi might pick it up from the merged body. Make it optional in the body schema itself.
  // Use the exact snake_case names from your model
  hive_id: Joi.string().uuid().required(),
  inspection_time: Joi.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  colony_health_status_id: Joi.number().integer().required(),
  num_chambers: Joi.number().integer().min(0).required(),
  brood_chambers_count: Joi.number().integer().min(0).required(),
  supers_count: Joi.number().integer().min(0).required(),
  brood_frames_count: Joi.number().integer().min(0).optional().allow(null),
  brood_percentage: Joi.string().optional().allow(null),
  queen_status_id: Joi.number().integer().required(),
  approx_honey_weight_kg: Joi.string().optional().allow(null),
  drone_comb_frames_count: Joi.number().integer().min(0).optional().allow(null),
  drone_comb_percentage: Joi.string().optional().allow(null),
  sugar_feed_added: Joi.boolean().optional().allow(null),
  sugar_feed_quantity_kg: Joi.number().integer().optional().allow(null),
  queen_excluder_present: Joi.boolean().optional().allow(null),
  num_varroa_mites_found: Joi.number().integer().min(0).optional().allow(null),
  varroa_treatment_id: Joi.number().integer().optional().allow(null),
  varroa_treatment_dosage: Joi.string().optional().allow(null),
  raising_new_queen: Joi.boolean().optional().allow(null),
  queen_cell_age_days: Joi.number().integer().min(0).optional().allow(null),
  queen_cell_status_id: Joi.number().integer().optional().allow(null),
  other_notes: Joi.string().optional().allow(null),
});

// All fields optional for update
const updateHiveInspectionSchema = Joi.object<hive_inspectionsAttributes>({
  hive_id: Joi.string().trim().optional(),
  inspection_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional()
    .messages({
      'string.pattern.base': 'Inspection hour must be in HH:MM format (e.g., 14:30)',
    }),
  colony_health_status_id: Joi.number().integer().optional(),
  num_chambers: Joi.number().integer().min(1).optional(),
  brood_frames_count: Joi.string().optional(),
  queen_status_id: Joi.number().integer().optional(),
  approx_honey_weight_kg: Joi.number().integer().optional(),
  drone_comb_frames_count: Joi.number().integer().optional(),
  sugar_feed_added: Joi.boolean().optional(),
  sugar_feed_quantity_kg: Joi.number().allow(null, '').optional(),
  num_varroa_mites_found: Joi.number().integer().min(0).optional(),
  //varroaTreatment: Joi.boolean().optional(),
  // treatmentApplied: Joi.string()
  //   .valid(...Object.values(TreatmentApplied))
  //   .allow(null)
  //   .optional(),
  varroa_treatment_id: Joi.number().integer().optional().allow(null),
  varroa_treatment_dosage: Joi.string().allow(null, '').optional(),
  raising_new_queen: Joi.boolean().optional(),
  queen_cell_age_days: Joi.number().integer().min(0).allow(null).optional(),
  queen_cell_status_id: Joi.number().integer().optional(),
  other_notes: Joi.string().trim().max(1000).allow(null, '').optional(),
});

const specificHiveInspectionParamsSchema = Joi.object({
  locationId: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(),
  majorInspectionId: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(),
  hiveInspectionId: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(),
});

const rootHiveInspectionParamsSchema = Joi.object({
  majorInspectionId: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(),
  // Add the locationId to the schema to allow it
  locationId: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(),
});

// POST /api/major-inspections/:majorInspectionId/hive-inspections - Create a hive inspection
hiveInspectionRouter.post(
  '/',
  isAuthenticated,
  validate({
    params: rootHiveInspectionParamsSchema,
    body: createHiveInspectionSchema,
  }),
  (req, res, next) => {
    console.log('Validation successful');
    next();
  },
  checkMajorInspectionOwnership, // Verify parent MajorInspection ownership
  HiveInspectionController.createHiveInspection
);

// GET /api/major-inspections/:majorInspectionId/hive-inspections - Get all hive inspections
hiveInspectionRouter.get(
  '/',
  (req, res, next) => {
    console.log('****** GET /   *****');
    next();
  },
  isAuthenticated,
  validate({
    params: rootHiveInspectionParamsSchema,
  }),
  async (req, res, next) => {
    console.log('****** GET /  joi validation setting timeout interval *****');
    setTimeout(() => {
      console.log('****** GET /  joi validation successful *****');
      next();
    }, 12000);
  },
  checkMajorInspectionOwnership,
  (req, res, next) => {
    console.log('****** GET /  ownership verified *****');
    next();
  },
  HiveInspectionController.getHiveInspectionsByMajorInspectionId
);

// GET /api/major-inspections/:majorInspectionId/hive-inspections/:hiveInspectionId - Get a specific hive inspection
hiveInspectionRouter.get(
  '/:hiveInspectionId',
  (req, res, next) => {
    console.log('****** GET /:hiveInspectionId  *****');
    next();
  },
  isAuthenticated,
  validate({ params: specificHiveInspectionParamsSchema }),
  checkMajorInspectionOwnership,
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
  '/:hiveInspectionId',
  (req, res, next) => {
    console.log('****** PUT /:hiveInspectionId  *****');
    next();
  },
  isAuthenticated,
  validate({
    params: specificHiveInspectionParamsSchema,
    body: updateHiveInspectionSchema,
  }),
  checkMajorInspectionOwnership,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { majorInspectionId, hiveInspectionId } = req.params;
      const updateData: hive_inspectionsAttributes = req.body;

      const updatedHiveInspection = await HiveInspectionService.updateHiveInspection(hiveInspectionId, majorInspectionId, updateData);

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
  '/:hiveInspectionId',
  (req, res, next) => {
    console.log('****** DELETE /:hiveInspectionId  *****');
    next();
  },
  isAuthenticated,
  validate({ params: specificHiveInspectionParamsSchema }),
  checkMajorInspectionOwnership,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { majorInspectionId, hiveInspectionId } = req.params;
      const success = await HiveInspectionService.deleteHiveInspection(hiveInspectionId, majorInspectionId);

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
