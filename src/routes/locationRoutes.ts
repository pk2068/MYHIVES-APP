// src/routes/locationRoutes.ts

import { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { LocationService } from '../services/locationService.js';
import { isAuthenticated } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { CreateLocationDto, UpdateLocationDto } from '../types/dtos.js';
import { CustomError } from '../middleware/errorHandler.js';
//import {CustomRequest} from '../types/custom-request.js';

const locationRouter = Router();

// --- Joi Schemas for Location ---
const createLocationSchema = Joi.object<CreateLocationDto>({
  name: Joi.string().trim().min(3).max(100).required(),
  address: Joi.string().trim().min(5).max(255).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  description: Joi.string().trim().max(500).allow(null, ''),
});

const updateLocationSchema = Joi.object<UpdateLocationDto>({
  name: Joi.string().trim().min(3).max(100).optional(),
  address: Joi.string().trim().min(5).max(255).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  description: Joi.string().trim().max(500).allow(null, '').optional(),
});

const locationIdParamSchema = Joi.object({
  locationId: Joi.string().guid({ version: ['uuidv4'] }).required(), // Validate as UUID
});

// POST /api/locations - Create a new location
locationRouter.post(
  '/',
  isAuthenticated,
  validate({ body: createLocationSchema }), // <--- Body validation
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const locationData: CreateLocationDto = req.body;
      const newLocation = await LocationService.createLocation(userId, locationData);
      res.status(201).json(newLocation);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/locations/:locationId - Get a specific location by ID
locationRouter.get(
  '/:locationId',
  isAuthenticated,
  validate({ params: locationIdParamSchema }), // <--- Params validation
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { locationId } = req.params;
      const userId = req.user!.id;
      const location = await LocationService.getLocationById(locationId, userId);

      if (!location) {
        const error: CustomError = new Error('Location not found or not owned by user');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json(location);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/locations/:locationId - Update a specific location by ID
locationRouter.put(
  '/:locationId',
  isAuthenticated,
  validate({ params: locationIdParamSchema, body: updateLocationSchema }), // <--- Both params and body validation
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { locationId } = req.params;
      const userId = req.user!.id;
      const updateData: UpdateLocationDto = req.body;

      const updatedLocation = await LocationService.updateLocation(locationId, userId, updateData);

      if (!updatedLocation) {
        const error: CustomError = new Error('Location not found or not owned by user');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json(updatedLocation);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/locations/:locationId - Delete a specific location by ID
locationRouter.delete(
  '/:locationId',
  isAuthenticated,
  validate({ params: locationIdParamSchema }), // <--- Params validation
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { locationId } = req.params;
      const userId = req.user!.id;

      const success = await LocationService.deleteLocation(locationId, userId);

      if (!success) {
        const error: CustomError = new Error('Location not found or not owned by user');
        error.statusCode = 404;
        throw error;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default locationRouter;