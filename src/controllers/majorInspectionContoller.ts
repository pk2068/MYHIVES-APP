// src/controllers/majorInspectionController.ts

import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../middleware/errorHandler';
import { MajorInspectionService } from '../services/majorInspectionService';
import { LocationService } from '../services/locationService'; // To check location ownership
import { MajorInspection as MajorInspectionInterface } from '../types/models';
import { CreateMajorInspectionDto, UpdateMajorInspectionDto } from '../types/dtos';

// Middleware to ensure location belongs to the authenticated user
const checkLocationOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { locationId } = req.params;

    const location = await LocationService.getLocationById(locationId, userId);
    if (!location) {
      const error = new Error('Location not found or unauthorized.') as CustomError;
      error.statusCode = 403; // Forbidden
      throw error;
    }
    next(); // Location is owned by the user, proceed
  } catch (error) {
    next(error);
  }
};

export const createMajorInspection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { locationId } = req.params;
    //const inspectionData: Partial<MajorInspectionInterface> = req.body;
    const inspectionData: CreateMajorInspectionDto = req.body;

    const newMajorInspection = await MajorInspectionService.createMajorInspection(locationId, inspectionData);

    res.status(201).json({
      success: true,
      message: 'Major inspection created successfully',
      data: newMajorInspection,
    });
  } catch (error) {
    next(error);
  }
};

export const getMajorInspections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { locationId } = req.params;

    const majorInspections = await MajorInspectionService.getMajorInspectionsByLocationId(locationId);

    res.status(200).json({
      success: true,
      data: majorInspections,
    });
  } catch (error) {
    next(error);
  }
};

export const getMajorInspectionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { majorInspectionId, locationId } = req.params;
    const userId = req.user!.id;

    const majorInspection = await MajorInspectionService.getMajorInspectionById(majorInspectionId, locationId, userId);

    if (!majorInspection) {
      const error = new Error('Major inspection not found.') as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: majorInspection,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMajorInspection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { majorInspectionId, locationId } = req.params;
    const updateData: UpdateMajorInspectionDto = req.body;

    const updatedMajorInspection = await MajorInspectionService.updateMajorInspection(majorInspectionId, locationId, updateData);

    if (!updatedMajorInspection) {
      const error = new Error('Major inspection not found.') as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Major inspection updated successfully',
      data: updatedMajorInspection,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMajorInspection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { majorInspectionId, locationId } = req.params;

    const deleted = await MajorInspectionService.deleteMajorInspection(majorInspectionId, locationId);

    if (!deleted) {
      const error = new Error('Major inspection not found.') as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Major inspection deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export { checkLocationOwnership }; // Export for use in routes
