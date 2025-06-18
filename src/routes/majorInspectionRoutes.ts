// src/routes/majorInspectionRoutes.ts

import { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { MajorInspectionService } from '../services/majorInspectionService';
import { LocationService } from '../services/locationService';
import { isAuthenticated } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { CreateMajorInspectionDto, UpdateMajorInspectionDto } from '../types/dtos';
import { CustomError } from '../middleware/errorHandler';
import '../types/custom-request';

const majorInspectionRouter = Router();

// --- Joi Schemas for MajorInspection ---
const createMajorInspectionSchema = Joi.object<CreateMajorInspectionDto>({
  // locationId will come from params, so it's not strictly 'required' in the body schema,
  // but if you also allow it in body, you can make it optional here and rely on merge in handler.
  // For clarity, we'll explicitly get it from params in the handler.
  inspectionDate: Joi.date().iso().required(),
  generalNotes: Joi.string().trim().max(1000).allow(null, ''),
});

const updateMajorInspectionSchema = Joi.object<UpdateMajorInspectionDto>({
  inspectionDate: Joi.date().iso().optional(),
  generalNotes: Joi.string().trim().max(1000).allow(null, '').optional(),
});

const majorInspectionParamsSchema = Joi.object({
  locationId: Joi.string().guid({ version: ['uuidv4'] }).required(),
  majorInspectionId: Joi.string().guid({ version: ['uuidv4'] }).required(),
});

// Middleware to check if the :locationId in the URL param belongs to the authenticated user
const checkLocationOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { locationId } = req.params;
    const userId = req.user!.id;

    const location = await LocationService.getLocationById(locationId, userId);
    if (!location) {
      const error: CustomError = new Error('Location not found or not owned by user');
      error.statusCode = 404;
      throw error;
    }
    next();
  } catch (error) {
    next(error);
  }
};

// POST /api/locations/:locationId/major-inspections - Create a major inspection
majorInspectionRouter.post(
  '/locations/:locationId/major-inspections',
  isAuthenticated,
  validate({
    params: Joi.object({ locationId: Joi.string().guid({ version: ['uuidv4'] }).required() }),
    body: createMajorInspectionSchema
  }),
  checkLocationOwnership, // Ensure the location belongs to the user
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { locationId } = req.params;
      const userId = req.user!.id;
      // Merge locationId from params into the DTO if it's not already in the body
      const inspectionData: CreateMajorInspectionDto = { ...req.body, locationId };

      const newMajorInspection = await MajorInspectionService.createMajorInspection(userId, inspectionData);
      res.status(201).json(newMajorInspection);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/locations/:locationId/major-inspections - Get all major inspections for a specific location
majorInspectionRouter.get(
  '/locations/:locationId/major-inspections',
  isAuthenticated,
  validate({ params: Joi.object({ locationId: Joi.string().guid({ version: ['uuidv4'] }).required() }) }),
  checkLocationOwnership,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { locationId } = req.params;
      const userId = req.user!.id;
      const majorInspections = await MajorInspectionService.getMajorInspectionsByLocationId(locationId, userId);
      res.status(200).json(majorInspections);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/locations/:locationId/major-inspections/:majorInspectionId - Get a specific major inspection
majorInspectionRouter.get(
  '/locations/:locationId/major-inspections/:majorInspectionId',
  isAuthenticated,
  validate({ params: majorInspectionParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { locationId, majorInspectionId } = req.params;
      const userId = req.user!.id;

      const majorInspection = await MajorInspectionService.getMajorInspectionById(
        majorInspectionId,
        locationId,
        userId
      );

      if (!majorInspection) {
        const error: CustomError = new Error('Major Inspection not found or not owned by user via this location');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json(majorInspection);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/locations/:locationId/major-inspections/:majorInspectionId - Update a specific major inspection
majorInspectionRouter.put(
  '/locations/:locationId/major-inspections/:majorInspectionId',
  isAuthenticated,
  validate({ params: majorInspectionParamsSchema, body: updateMajorInspectionSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { locationId, majorInspectionId } = req.params;
      const userId = req.user!.id;
      const updateData: UpdateMajorInspectionDto = req.body;

      const updatedMajorInspection = await MajorInspectionService.updateMajorInspection(
        majorInspectionId,
        locationId,
        userId,
        updateData
      );

      if (!updatedMajorInspection) {
        const error: CustomError = new Error('Major Inspection not found or not owned by user via this location');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json(updatedMajorInspection);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/locations/:locationId/major-inspections/:majorInspectionId - Delete a specific major inspection
majorInspectionRouter.delete(
  '/locations/:locationId/major-inspections/:majorInspectionId',
  isAuthenticated,
  validate({ params: majorInspectionParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { locationId, majorInspectionId } = req.params;
      const userId = req.user!.id;

      const success = await MajorInspectionService.deleteMajorInspection(
        majorInspectionId,
        locationId,
        userId
      );

      if (!success) {
        const error: CustomError = new Error('Major Inspection not found or not owned by user via this location');
        error.statusCode = 404;
        throw error;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default majorInspectionRouter;