/* define endpoints, joi schemas, and controllers for hive inspections */
import { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';

import hiveControler from '../controllers/hiveController.js';
import { hivesAttributes } from '../database/models-ts/hives.js';
import { isAuthenticated } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { CustomError } from '../middleware/errorHandler.js';

const hiveRouter = Router({ mergeParams: true });

const createHivesBodySchema = Joi.object<hivesAttributes>({
  location_id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(),
  hive_name: Joi.string().min(2).max(50).required(),
  description: Joi.string().min(2).max(200).required(),
  is_active: Joi.boolean().required(),
});

const updateHivesBodySchema = Joi.object<hivesAttributes>({
  location_id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .optional(),
  hive_name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().min(2).max(200).optional(),
  is_active: Joi.boolean().optional(),
});

const createHiveParamSchema = Joi.object({
  location_id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(),
});

const updateHiveParamSchema = Joi.object({
  location_id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(),
  hive_id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(),
});

//GET /api/v1/locations/:locationId/hives - Get all hives for a specific location.
hiveRouter.get('/', isAuthenticated, validate({ params: createHiveParamSchema }), hiveControler.getAllHives);
//POST /api/v1/locations/:locationId/hives - Create a new hive within a specific location.
hiveRouter.post('/', isAuthenticated, validate({ params: createHiveParamSchema, body: createHivesBodySchema }), hiveControler.createHive);

//GET /api/v1/locations/:locationId/hives/:hiveId - Get a specific hive.
hiveRouter.get('/:hive_id', isAuthenticated, validate({ params: updateHiveParamSchema }), hiveControler.getHiveById);

//PUT /api/v1/locations/:locationId/hives/:hiveId - Update a specific hive.
hiveRouter.put('/:hive_id', isAuthenticated, validate({ params: updateHiveParamSchema, body: updateHivesBodySchema }), hiveControler.updateHive);

//DELETE /api/v1/locations/:locationId/hives/:hiveId - Delete a specific hive.
hiveRouter.delete('/:hive_id', isAuthenticated, validate({ params: updateHiveParamSchema }), hiveControler.deleteHive);
hiveRouter.delete('/', isAuthenticated, validate({ params: createHiveParamSchema }), hiveControler.deleteAllHives);

export default hiveRouter;
