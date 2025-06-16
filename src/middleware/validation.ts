import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { CustomError } from './errorHandler';

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
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const { error } = schemas.body.validate(req.body, { abortEarly: false }); // abortEarly: false to get all errors
        if (error) {
          const validationError = new Error(error.details.map(d => d.message).join(', ')) as CustomError;
          validationError.statusCode = 400; // Bad Request
          validationError.data = error.details; // Include details for frontend parsing
          throw validationError;
        }
      }

      if (schemas.params) {
        const { error } = schemas.params.validate(req.params, { abortEarly: false });
        if (error) {
          const validationError = new Error(error.details.map(d => d.message).join(', ')) as CustomError;
          validationError.statusCode = 400;
          validationError.data = error.details;
          throw validationError;
        }
      }

      if (schemas.query) {
        const { error } = schemas.query.validate(req.query, { abortEarly: false });
        if (error) {
          const validationError = new Error(error.details.map(d => d.message).join(', ')) as CustomError;
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
// const locationSchema = Joi.object({
//   name: Joi.string().trim().min(3).max(100).required(),
//   address: Joi.string().trim().min(5).max(255).required(),
//   latitude: Joi.number().min(-90).max(90).required(),
//   longitude: Joi.number().min(-180).max(180).required(),
//   description: Joi.string().trim().max(500).allow(null, ''),
// });

// export const createLocationSchema = { body: locationSchema };
// export const updateLocationSchema = { body: locationSchema.optional() }; // All fields optional for update