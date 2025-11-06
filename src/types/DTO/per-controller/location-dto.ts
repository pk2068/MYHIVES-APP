import { locationsAttributes } from '../../../database/models-ts/locations.js';

// Location domain types
export type LocationCreationDTO = Omit<locationsAttributes, 'location_id' | 'created_at' | 'updated_at'>;
export type LocationUpdateDTO = Partial<Omit<locationsAttributes, 'location_id' | 'created_at' | 'updated_at'>>;
export type LocationRetrievedDTO = Omit<locationsAttributes, ''>;
