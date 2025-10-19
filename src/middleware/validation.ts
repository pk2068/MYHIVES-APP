import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { CustomError } from './errorHandler.js';
// import {
//   validationResult,
//   body,
//   param,
//   ValidationChain,
// } from "express-validator"; // Import ValidationChain

import { ColonyHealthStatus, QueenStatus, TreatmentApplied, QueenCellStatus } from '../types/foobar.js';

// Type definition for a validation schema map
type SchemaMap = {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
};

/**
 * Middleware to validate request data against a Joi schema.
 * @param schemas An object containing Joi schemas for body, params, and/or query.
 */
export const validate = (schemas: SchemaMap) => {
  // console.log('Validation middleware initialized with schemas:', schemas);
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const { error } = schemas.body.validate(req.body, {
          abortEarly: false,
        }); // abortEarly: false to get all errors
        if (error) {
          const validationError = new Error(error.details.map((d) => d.message).join(', ')) as CustomError;
          validationError.statusCode = 400; // Bad Request
          validationError.data = error.details; // Include details for frontend parsing
          throw validationError;
        }
      }

      if (schemas.params) {
        const { error } = schemas.params.validate(req.params, {
          abortEarly: false,
        });
        if (error) {
          const validationError = new Error(error.details.map((d) => d.message).join(', ')) as CustomError;
          validationError.statusCode = 400;
          validationError.data = error.details;
          throw validationError;
        }
      }

      if (schemas.query) {
        const { error } = schemas.query.validate(req.query, {
          abortEarly: false,
        });
        if (error) {
          const validationError = new Error(error.details.map((d) => d.message).join(', ')) as CustomError;
          validationError.statusCode = 400;
          validationError.data = error.details;
          throw validationError;
        }
      }

      next(); // If validation passes, move to the next middleware/route handler
    } catch (error) {
      next(error); // Pass any validation errors to the error handling middleware
    }
  };
};

// --- Example Joi Schemas (you will create these in your controllers or a separate schema file) ---
export const locationSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required(),
  address: Joi.string().trim().min(5).max(255).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  description: Joi.string().trim().max(500).allow(null, ''),
});

export const createHiveInspectionSchema = Joi.object({
  // majorInspectionId: Joi.string().uuid().required(), // This might come from params, not body
  hiveNumber: Joi.string().required(),
  inspectionHour: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .required(),
  colonyHealthStatus: Joi.string()
    .valid(...Object.values(ColonyHealthStatus))
    .required(),
  numberOfChambers: Joi.number().integer().min(1).required(),
  amountOfBrood: Joi.string().required(),
  queenStatus: Joi.string()
    .valid(...Object.values(QueenStatus))
    .required(),
  approximateAmountOfHoney: Joi.string().required(),
  amountOfDroneComb: Joi.string().required(),
  sugarFeedAdded: Joi.boolean().required(),
  sugarFeedQuantity: Joi.string().allow(null).optional(),
  beehiveConfiguration: Joi.object({
    type: Joi.string().required(),
    numberOfFrames: Joi.number().integer().min(1).required(),
    materials: Joi.array().items(Joi.string()).optional(),
    isInsulated: Joi.boolean().optional(),
  }).required(),
  numberOfVarroaMitesFound: Joi.number().integer().min(0).required(),
  varroaTreatment: Joi.boolean().required(),
  treatmentApplied: Joi.string()
    .valid(...Object.values(TreatmentApplied))
    .allow(null)
    .optional(),
  dosageAmount: Joi.string().allow(null).optional(),
  raisingNewQueen: Joi.boolean().required(),
  queenCellAge: Joi.number().integer().min(0).allow(null).optional(),
  queenCellStatus: Joi.string()
    .valid(...Object.values(QueenCellStatus))
    .allow(null)
    .optional(),
  otherNotes: Joi.string().allow(null).optional(),
});

export const updateHiveInspectionSchema = Joi.object({
  // All fields from createHiveInspectionSchema, but optional
  hiveNumber: Joi.string().optional(),
  // ... and so on for all fields, with .optional()
}).min(1); // At least one field must be provided for update
