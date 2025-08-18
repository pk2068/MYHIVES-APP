// src/routes/locationRoutes.ts

import { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { LocationService } from '../services/locationService.js';
import { isAuthenticated } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { createLocation, getLocations, getLocationById, updateLocation, deleteLocation, getMapData } from '../controllers/locationController.js'; // <-- Import the controller functions

// import { CreateLocationDto, UpdateLocationDto } from '../types/dtos.js';
import { locationsAttributes } from 'database/models-ts/locations.js';
import { CustomError } from '../middleware/errorHandler.js';
//import {CustomRequest} from '../types/custom-request.js';

const locationRouter = Router();

// --- Joi Schemas for Location ---
const createLocationSchema = Joi.object<locationsAttributes>({
  name: Joi.string().trim().min(3).max(100).required(),
  address: Joi.string().trim().min(5).max(255).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  notes: Joi.string().trim().max(500).allow(null, ''),
  country: Joi.string().trim().max(100).allow(null, ''),
});

const updateLocationSchema = Joi.object<locationsAttributes>({
  name: Joi.string().trim().min(3).max(100).optional(),
  address: Joi.string().trim().min(5).max(255).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  notes: Joi.string().trim().max(500).allow(null, '').optional(),
});

const locationIdParamSchema = Joi.object({
  locationId: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(), // Validate as UUID
});

// POST /api/locations - Create a new location
locationRouter.post(
  '/',
  isAuthenticated,
  validate({ body: createLocationSchema }), // <--- Body validation
  createLocation
);

// GET /api/locations - Get all locations for the authenticated user
locationRouter.get(
  '/',
  isAuthenticated,
  getLocations // <-- Correctly use the controller function
);

// GET /api/locations/:locationId - Get a specific location by ID
locationRouter.get(
  '/:locationId',
  isAuthenticated,
  validate({ params: locationIdParamSchema }), // <--- Params validation
  getLocationById
);

// PUT /api/locations/:locationId - Update a specific location by ID
locationRouter.put(
  '/:locationId',
  isAuthenticated,
  validate({ params: locationIdParamSchema, body: updateLocationSchema }), // <--- Both params and body validation
  updateLocation
);

// DELETE /api/locations/:locationId - Delete a specific location by ID
locationRouter.delete(
  '/:locationId',
  isAuthenticated,
  validate({ params: locationIdParamSchema }), // <--- Params validation
  deleteLocation
);

// GET /api/locations/map - Get map data
locationRouter.get('/map', isAuthenticated, getMapData);

export default locationRouter;
