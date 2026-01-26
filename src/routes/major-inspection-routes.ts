// src/routes/majorInspectionRoutes.ts

import { NextFunction, Response, Request, Router } from 'express';
import Joi from 'joi';

//import { isAuthenticated } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { MajorInspectionService } from '../services/major-inspection-service.js';
import { MajorInspectionController } from '../controllers/major-inspection-contoller.js';
import { IMajorInspectionRepository } from '../repositories/interfaces/i-major-inspection-repository.js';
import { MajorInspectionRepository } from '../repositories/implementations/major-inspection-repository.js';
import { sequelizeInstance as database } from '../database/connect.js';
import { checkMajorInspectionOwnership } from '../middleware/ownership.js';
import { authorizeRole } from '../middleware/permission.js';

// import { checkLocationOwnership } from '../middleware/ownership.js'; // is already handled in parent route
import { major_inspectionsAttributes } from '../database/models-ts/major-inspections.js';
import hiveInspectionRouter from './hive-inspection-routes.js';

const majorInspectionRouter = Router({ mergeParams: true });

// --- DI SETUP ---

const majorInspectionRepository: IMajorInspectionRepository = new MajorInspectionRepository(database);
const majorInspectionService = new MajorInspectionService(majorInspectionRepository);
const majorInspectionController = new MajorInspectionController(majorInspectionService);

// --- Instantiate the HOF to create the middleware function ---
const majorInspectionOwnershipMiddleware = checkMajorInspectionOwnership(majorInspectionService);
// --- END DI SETUP ---

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
  // console.log('Logging major inspections requests ...', req.params, req.body);
  next();
};
//majorInspectionRouter.use(loggging);

// Mount nested major inspection routes
// majorInspectionRouter.use('/:majorInspectionId/hive-inspections', (req, res, next) => {
//   next();
// });
majorInspectionRouter.use('/:majorInspectionId/hive-inspections', majorInspectionOwnershipMiddleware, hiveInspectionRouter);

// POST /api/locations/:locationId/major-inspections - Create a major inspection
majorInspectionRouter.post(
  '/',
  authorizeRole(['user', 'admin']),
  validate({
    params: Joi.object({
      locationId: Joi.string()
        .guid({ version: ['uuidv4'] })
        .required(),
    }),
    body: createMajorInspectionSchema,
  }),
  //majorInspectionOwnershipMiddleware, // Verify only location ownership for creation ... you can not check what does not exist yet
  majorInspectionController.createMajorInspection
);

// GET /api/locations/:locationId/major-inspections - Get all major inspections for a specific location
majorInspectionRouter.get(
  '/',
  authorizeRole(['admin', 'vet', 'user']),
  //majorInspectionOwnershipMiddleware, // -
  majorInspectionController.getMajorInspections
);

// GET /api/locations/:locationId/major-inspections/:majorInspectionId - Get a specific major inspection
majorInspectionRouter.get(
  '/:majorInspectionId',
  authorizeRole(['admin', 'vet', 'user']),
  validate({ params: majorInspectionParamsSchema }),
  majorInspectionOwnershipMiddleware,
  majorInspectionController.getSpecificMajorInspectionById
);

// PUT /api/locations/:locationId/major-inspections/:majorInspectionId - Update a specific major inspection
majorInspectionRouter.put(
  '/:majorInspectionId',
  authorizeRole(['user', 'admin']),
  validate({
    params: majorInspectionParamsSchema,
    body: updateMajorInspectionSchema,
  }),
  majorInspectionOwnershipMiddleware,
  majorInspectionController.updateMajorInspection
);

// DELETE /api/locations/:locationId/major-inspections/:majorInspectionId - Delete a specific major inspection
majorInspectionRouter.delete(
  '/:majorInspectionId',
  authorizeRole(['user', 'admin']),
  validate({ params: majorInspectionParamsSchema }),
  majorInspectionOwnershipMiddleware,
  majorInspectionController.deleteMajorInspection
);

export default majorInspectionRouter;
