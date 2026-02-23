/* define endpoints, joi schemas, and controllers for hive inspections */
import { Router } from 'express';
import Joi from 'joi';

import { HiveController } from '../controllers/hive-controller.js';
import { HiveRepository } from '../repositories/implementations/hive-repository.js';
import { HiveService } from '../services/hive-service.js';
//import { hivesAttributes } from '../database/models-ts/hives.js';
//import { isAuthenticated } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/permission.js';
import { sequelizeInstance as database } from '../database/connect.js';
import { validate } from '../middleware/validation.js';
import { HiveControllerCreateDTO, HiveControllerCreateStrongDTO, HiveControllerUpdateDTO } from '../controllers/dto/hive-controller.dto.js';
import { HiveInspectionController } from 'controllers/hive-inspection-controller.js';
import hiveInspectionRouter from './hive-inspection-routes.js';

const hiveRouter = Router({ mergeParams: true });
// --- DI SETUP ---
const hiveRepository = new HiveRepository(database); // Concrete implementation
const hiveService = new HiveService(hiveRepository); // Inject Repository into Service
const hiveController = new HiveController(hiveService); // Inject Service into Controller
// --- END DI SETUP ---

const createHivesBodySchema = Joi.object<HiveControllerCreateStrongDTO>({
  // locationId: Joi.string()
  //   .guid({ version: ['uuidv4'] })
  //   .required(),
  hive_name: Joi.string().min(2).max(50).required(),
  description: Joi.string().min(2).max(200).required(),
  is_active: Joi.boolean().required(),
});

const updateHivesBodySchema = Joi.object<HiveControllerUpdateDTO>({
  // locationId: Joi.string()
  //   .guid({ version: ['uuidv4'] })
  //   .optional(),
  hive_name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().min(2).max(200).optional(),
  is_active: Joi.boolean().optional(),
});

const createHiveParamSchema = Joi.object({
  locationId: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(),
});

const updateHiveParamSchema = Joi.object({
  locationId: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(),
  hive_id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(),
});

hiveRouter.use('/:hive_id/inspections', hiveInspectionRouter);
// //GET /api/v1/locations/:locationId/hives/:hiveId/inspections - Get hive history for a specific hive (all hives and their inspections).
// hiveRouter.get(
//   '/:hive_id/inspections',
//   isAuthenticated,
//   authorizeRole(['admin', 'vet', 'user']),
//   validate({ params: updateHiveParamSchema }),
//   //checkHiveOwnershipMiddleware(hiveController._hiveService), // Custom middleware to check if the user owns the hive
//   HiveInspectionController.getHiveInspectionHistory
// );

// // GET /api/v1/locations/:locationId/hives/:hiveId/inspections/range - get hive history for a specific hive within a date range (query params: startDate, endDate).
// hiveRouter.get(
//   '/:hive_id/inspections/range',
//   isAuthenticated,
//   authorizeRole(['admin', 'vet', 'user']),
//   validate({ params: updateHiveParamSchema, query: Joi.object({ startDate: Joi.date().required(), endDate: Joi.date().optional() }) }),
//   //checkHiveOwnershipMiddleware(hiveController._hiveService), // Custom middleware to check if the user owns the hive
//   HiveInspectionController.getHiveInspectionHistoryByDateRange
// );

//GET /api/v1/locations/:locationId/hives - Get all hives for a specific location.
hiveRouter.get(
  '/',
  // (req, res, next) => {
  //   console.log('Router : Fetching hives...', req.params);
  //   next();
  // },
  authorizeRole(['admin', 'vet', 'spectator', 'user']),
  validate({ params: createHiveParamSchema }),
  hiveController.getAllHives
);
//POST /api/v1/locations/:locationId/hives - Create a new hive within a specific location.
hiveRouter.post('/', validate({ params: createHiveParamSchema, body: createHivesBodySchema }), hiveController.createHive);

//GET /api/v1/locations/:locationId/hives/:hiveId - Get a specific hive.
hiveRouter.get(
  '/:hive_id',
  authorizeRole(['admin', 'vet', 'user']),
  // (req, res, next) => {
  //   console.log('Router : Fetching specific hive ...', req.params);
  //   next();
  // },
  validate({ params: updateHiveParamSchema }),
  hiveController.getHiveById
);

//PUT /api/v1/locations/:locationId/hives/:hiveId - Update a specific hive.
hiveRouter.put(
  '/:hive_id',
  authorizeRole(['user']),
  // (req, res, next) => {
  //   console.log('Router : Updating specific hive ...', req.params);
  //   next();
  // },
  validate({ params: updateHiveParamSchema, body: updateHivesBodySchema }),
  hiveController.updateHive
);

//DELETE /api/v1/locations/:locationId/hives/:hiveId - Delete a specific hive.
hiveRouter.delete(
  '/:hive_id',
  authorizeRole(['user']),
  // (req, res, next) => {
  //   console.log('Router : Deleting specific hive ...', req.params);
  //   next();
  // },
  validate({ params: updateHiveParamSchema }),
  hiveController.deleteHive
);
hiveRouter.delete(
  '/',
  authorizeRole(['user', 'admin']),
  // (req, res, next) => {
  //   console.log('Router : Deleting all hives ...', req.params);
  //   next();
  // },
  validate({ params: createHiveParamSchema }),
  hiveController.deleteAllHives
);

export default hiveRouter;
