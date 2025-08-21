// src/routes/majorInspectionRoutes.ts

import { NextFunction, Response, Request, Router } from 'express';
import Joi from 'joi';
// import { MajorInspectionService } from '../services/majorInspectionService.js';
// import { LocationService } from '../services/locationService.js';
import { isAuthenticated } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { CreateMajorInspectionDto, UpdateMajorInspectionDto } from '../types/dtos.js';
// import { CustomError } from '../middleware/errorHandler.js';
//import {CustomRequest} from '../types/custom-request.js';
import { createMajorInspection, checkLocationOwnership, getMajorInspections, getMajorInspectionById, updateMajorInspection, deleteMajorInspection } from '../controllers/majorInspectionContoller.js';
import { major_inspectionsAttributes } from '../database/models-ts/major_inspections.js';
import { MajorInspectionService } from '../services/majorInspectionService.js';
//import { get } from 'http';

console.log('FOOBAR');

const majorInspectionRouter = Router({ mergeParams: true });

// --- Joi Schemas for MajorInspection ---
const createMajorInspectionSchema = Joi.object<major_inspectionsAttributes>({
  // locationId will come from params, so it's not strictly 'required' in the body schema,
  // but if you also allow it in body, you can make it optional here and rely on merge in handler.
  // For clarity, we'll explicitly get it from params in the handler.
  inspection_date: Joi.date().iso().required(),
  general_notes: Joi.string().trim().max(1000).allow(null, ''),
});

const updateMajorInspectionSchema = Joi.object<major_inspectionsAttributes>({
  inspection_date: Joi.date().iso().optional(),
  general_notes: Joi.string().trim().max(1000).allow(null, '').optional(),
});

const majorInspectionParamsSchema = Joi.object({
  locationId: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(),
  majorInspectionId: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(),
});

const loggging = async (req: Request, res: Response, next: NextFunction) => {
  console.log('Logging major inspections requests ...', req.params, req.body);
  next();
};

majorInspectionRouter.use(loggging);

// POST /api/locations/:locationId/major-inspections - Create a major inspection
majorInspectionRouter.post(
  '/',
  isAuthenticated,
  validate({
    params: Joi.object({
      locationId: Joi.string()
        .guid({ version: ['uuidv4'] })
        .required(),
    }),
    body: createMajorInspectionSchema,
  }),
  checkLocationOwnership, // Ensure the location belongs to the user //createMajorInspection
  createMajorInspection
);

// GET /api/locations/:locationId/major-inspections - Get all major inspections for a specific location
majorInspectionRouter.get('/', isAuthenticated, checkLocationOwnership, getMajorInspections);

// GET /api/locations/:locationId/major-inspections/:majorInspectionId - Get a specific major inspection
majorInspectionRouter.get('/:majorInspectionId', isAuthenticated, validate({ params: majorInspectionParamsSchema }), checkLocationOwnership, getMajorInspectionById);

// PUT /api/locations/:locationId/major-inspections/:majorInspectionId - Update a specific major inspection
majorInspectionRouter.put(
  '/:majorInspectionId',
  isAuthenticated,
  validate({
    params: majorInspectionParamsSchema,
    body: updateMajorInspectionSchema,
  }),
  checkLocationOwnership,
  updateMajorInspection
);

// DELETE /api/locations/:locationId/major-inspections/:majorInspectionId - Delete a specific major inspection
majorInspectionRouter.delete('/:majorInspectionId', isAuthenticated, validate({ params: majorInspectionParamsSchema }), checkLocationOwnership, deleteMajorInspection);

export default majorInspectionRouter;
