import { locationsAttributes } from '../../database/models-ts/locations.js';

// Location domain types - for creating, updating, and retrieving location data
// The service layer uses these DTOs to enforce data shape and decouple from Sequelize's model attributes.

// Data required to create a new location
export type LocationServiceCreateDTO = Omit<locationsAttributes, 'location_id' | 'created_at' | 'updated_at'>;

// Data used to update an existing location (all fields optional)
export type LocationServiceUpdateDTO = Partial<Omit<LocationServiceCreateDTO, 'user_id'>>;

// Data shape of a fully retrieved location record
export type LocationServiceRetrievedDTO = locationsAttributes;
