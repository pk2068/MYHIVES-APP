// src/routes/locationRoutes.ts

import { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
//import { LocationService } from '../services/locationService.js';
import { isAuthenticated } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { LocationController } from '../controllers/location-controller.js';
import { LocationService } from '../services/location-service.js';
import { LocationRepository } from '../repositories/implementations/location-repository.js';
import { sequelizeInstance as database } from '../database/connect.js';
import { LocationControllerUpdateInputDTO, LocationControllerCreateInputDTO } from '../controllers/dto/location-controller.dto.js';
//import { createLocation, getLocations, getLocationById, updateLocation, deleteLocation, getMapData } from '../controllers/location-controller.js'; // <-- Import the controller functions

//import { locationsAttributes } from '../database/models-ts/locations.js';

import majorInspectionRouter from './majorInspectionRoutes.js';
import hiveRouter from './hiveRoutes.js';
import { checkLocationOwnership } from '../middleware/ownership.js';

const locationRouter = Router();

// --- DI SETUP ---
const locationRepository = new LocationRepository(database); // Concrete implementation
const locationService = new LocationService(locationRepository); // Inject Repository into Service
const locationController = new LocationController(locationService); // Inject Service into Controller
// --- END DI SETUP ---

// --- Joi Schemas for Location ---
const createLocationSchema = Joi.object<LocationControllerCreateInputDTO>({
  name: Joi.string().trim().min(3).max(100).required(),
  address: Joi.string().trim().min(5).max(255).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  notes: Joi.string().trim().max(500).allow(null, ''),
  country: Joi.string().trim().max(100).allow(null, ''),
});

const updateLocationSchema = Joi.object<LocationControllerUpdateInputDTO>({
  name: Joi.string().trim().min(3).max(100).optional(),
  address: Joi.string().trim().min(5).max(255).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  notes: Joi.string().trim().max(500).allow(null, '').optional(),
  country: Joi.string().trim().max(100).allow(null, '').optional(),
});

const locationIdParamSchema = Joi.object({
  locationId: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(), // Validate as UUID
});

const ownershipLocationMiddleware = checkLocationOwnership(locationService);

// Mount nested major inspection routes
locationRouter.use('/:locationId/major-inspections', isAuthenticated, ownershipLocationMiddleware, majorInspectionRouter);
locationRouter.use('/:locationId/hives', isAuthenticated, ownershipLocationMiddleware, hiveRouter);

// POST /api/locations - Create a new location
locationRouter.post(
  '/',
  isAuthenticated,
  validate({ body: createLocationSchema }), // <--- Body validation
  locationController.createLocation
);

// GET /api/locations/map - Get map data
locationRouter.get('/map', isAuthenticated, locationController.getMapData);

// GET /api/locations - Get all locations for the authenticated user
locationRouter.get('/', isAuthenticated, locationController.getAllLocations);

// GET /api/locations/:locationId - Get a specific location by ID
locationRouter.get(
  '/:locationId',
  isAuthenticated,
  validate({ params: locationIdParamSchema }), // <--- Params validation
  ownershipLocationMiddleware,
  locationController.getLocationById
);

// PUT /api/locations/:locationId - Update a specific location by ID
locationRouter.put(
  '/:locationId',
  isAuthenticated,
  validate({ params: locationIdParamSchema, body: updateLocationSchema }), // <--- Both params and body validation
  ownershipLocationMiddleware,
  locationController.updateLocation
);

// DELETE /api/locations/:locationId - Delete a specific location by ID
locationRouter.delete(
  '/:locationId',
  isAuthenticated,
  validate({ params: locationIdParamSchema }), // <--- Params validation
  ownershipLocationMiddleware,
  locationController.deleteLocation
);

// // Mount nested major inspection routes
// locationRouter.use('/:locationId/major-inspections', majorInspectionRouter);

export default locationRouter;
