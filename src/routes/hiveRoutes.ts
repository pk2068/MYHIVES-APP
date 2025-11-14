/* define endpoints, joi schemas, and controllers for hive inspections */
import { Router } from 'express';
import Joi from 'joi';

import { HiveController } from '../controllers/hive-controller.js';
import { HiveRepository } from 'repositories/implementations/hive-repository.js';
import { HiveService } from 'services/hive-service.js';
//import { hivesAttributes } from '../database/models-ts/hives.js';
import { isAuthenticated } from '../middleware/auth.js';
import { sequelizeInstance as database } from '../database/connect.js';
import { validate } from '../middleware/validation.js';
import { HiveControllerCreateDTO, HiveControllerCreateStrongDTO, HiveControllerUpdateDTO } from 'controllers/dto/hive-controller.dto.js';

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

//GET /api/v1/locations/:locationId/hives - Get all hives for a specific location.
hiveRouter.get(
  '/',
  isAuthenticated,
  (req, res, next) => {
    console.log('Router : Fetching hives...', req.params);
    next();
  },
  validate({ params: createHiveParamSchema }),
  hiveController.getAllHives
);
//POST /api/v1/locations/:locationId/hives - Create a new hive within a specific location.
hiveRouter.post('/', isAuthenticated, validate({ params: createHiveParamSchema, body: createHivesBodySchema }), hiveController.createHive);

//GET /api/v1/locations/:locationId/hives/:hiveId - Get a specific hive.
hiveRouter.get(
  '/:hive_id',
  isAuthenticated,
  (req, res, next) => {
    console.log('Router : Fetching specific hive ...', req.params);
    next();
  },
  validate({ params: updateHiveParamSchema }),
  hiveController.getHiveById
);

//PUT /api/v1/locations/:locationId/hives/:hiveId - Update a specific hive.
hiveRouter.put(
  '/:hive_id',
  isAuthenticated,
  (req, res, next) => {
    console.log('Router : Updating specific hive ...', req.params);
    next();
  },
  validate({ params: updateHiveParamSchema, body: updateHivesBodySchema }),
  hiveController.updateHive
);

//DELETE /api/v1/locations/:locationId/hives/:hiveId - Delete a specific hive.
hiveRouter.delete(
  '/:hive_id',
  isAuthenticated,
  (req, res, next) => {
    console.log('Router : Deleting specific hive ...', req.params);
    next();
  },
  validate({ params: updateHiveParamSchema }),
  hiveController.deleteHive
);
hiveRouter.delete(
  '/',
  isAuthenticated,
  (req, res, next) => {
    console.log('Router : Deleting all hives ...', req.params);
    next();
  },
  validate({ params: createHiveParamSchema }),
  hiveController.deleteAllHives
);

export default hiveRouter;
