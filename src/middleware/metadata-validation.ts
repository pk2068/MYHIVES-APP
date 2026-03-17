import Joi from 'joi';
import { MetadataCategory } from '../types/metadata-types.js';

const validCategories: MetadataCategory[] = ['varroa_treatments', 'queen_statuses', 'queen_cell_statuses', 'colony_health_statuses'];

const lookupItemSchema = Joi.object({
  id: Joi.number().integer().positive().allow(null), // Allow null for new items being created
  name: Joi.string().min(1).max(100).required(),
});

const paramsSchema = Joi.object({
  category: Joi.string()
    .valid(...validCategories)
    .required(),
});

export const createMetadataSchema = {
  body: Joi.object({
    varroa_treatments: Joi.array().items(lookupItemSchema).required(),
    queen_statuses: Joi.array().items(lookupItemSchema).required(),
    queen_cell_statuses: Joi.array().items(lookupItemSchema).required(),
    colony_health_statuses: Joi.array().items(lookupItemSchema).required(),
  }),
};

export const addMetadataSchema = {
  params: paramsSchema,
  body: Joi.array().items(lookupItemSchema).required(), // Can be an empty array to clear a category
};

export const deleteMetadataSchema = {
  params: paramsSchema,
  body: Joi.object({
    ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
  }).required(),
};
