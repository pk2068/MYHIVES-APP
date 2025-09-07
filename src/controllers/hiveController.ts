import { Request, Response, NextFunction } from 'express';
import { HiveService } from '../services/hiveService.js';
import { CustomError } from '../middleware/errorHandler.js';
import { hivesAttributes } from '../database/models-ts/hives.js';

// Get all hives
export const getAllHives = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Controller : Fetching hives...', req.params);

    const location_id = req.params.locationId;
    const hives = await HiveService.getHivesByLocationId(location_id);

    res.status(200).json({
      success: true,
      message: 'Hives fetched successfully',
      data: hives,
    });
  } catch (error) {
    //res.status(500).json({ error: 'Failed to fetch hives' });
    next(error);
  }
};

// Get hive by ID
const getHiveById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Controller : Fetching hive...', req.params);

    const location_id = req.params.locationId;
    const hive_id = req.params.hive_id;

    const hive = await HiveService.getHiveById(location_id, hive_id);

    if (!hive) {
      const error = new Error('Hive not found.') as CustomError;
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      success: true,
      message: 'Hive fetched successfully',
      data: hive,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new hive
const createHive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Creating hive...', req.params.locationId, req.body);
    const location_id = req.params.locationId;
    const hiveData = req.body;

    console.log('Hive data:', hiveData);

    const newHive = await HiveService.createHive(location_id, hiveData);

    res.status(201).json(newHive);
  } catch (error) {
    next(error);
  }
};

// Update a hive
const updateHive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location_id = req.params.locationId;
    const hive_id = req.params.hive_id;
    const updatedHiveData = req.body;

    const updatedHive = await HiveService.updateHive(location_id, hive_id, updatedHiveData);
    if (!updatedHive) {
      const error = new Error('Hive not found.') as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Hive updated successfully',
      data: updatedHive,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a hive
const deleteHive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location_id = req.params.locationId;
    const hive_id = req.params.hive_id;

    console.log('Controller : Deleting hive...', req.params);

    const deleted = await HiveService.deleteHive(location_id, hive_id);
    if (!deleted) {
      const error = new Error('Hive not found.') as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Hive deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Delete all hives
const deleteAllHives = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location_id = req.params.location_id;

    const deleted = await HiveService.deleteAllHives(location_id);
    if (!deleted) {
      const error = new Error('Hives not deleted.') as CustomError;
      error.statusCode = 404;
      throw error;
    }
    res.json({ message: 'Hives deleted successfully', success: true });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllHives,
  getHiveById,
  createHive,
  updateHive,
  deleteHive,
  deleteAllHives,
};
