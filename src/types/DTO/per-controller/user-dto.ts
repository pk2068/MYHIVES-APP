import { usersAttributes } from '../../../database/models-ts/users.js';
import { locationsAttributes } from '../../../database/models-ts/locations.js';
import { hivesAttributes } from '../../../database/models-ts/hives.js';
import { major_inspectionsAttributes } from '../../../database/models-ts/major_inspections.js';
import { hive_inspectionsAttributes } from '../../../database/models-ts/hive_inspections.js';

// User domain types - for creating, updating, and retrieving user data
export type UserCreationDTO = Omit<usersAttributes, 'user_id' | 'created_at' | 'updated_at' | 'google_id' | 'linkedin_id'>;
export type UserUpdateDTO = Partial<Omit<usersAttributes, 'user_id' | 'created_at' | 'updated_at' | 'google_id' | 'linkedin_id'>>;
export type UserRetrievedDTO = Omit<usersAttributes, 'google_id' | 'linkedin_id'>;

// Location domain types
export type LocationCreationDTO = Omit<locationsAttributes, 'location_id' | 'created_at' | 'updated_at'>;
export type LocationUpdateDTO = Partial<Omit<locationsAttributes, 'location_id' | 'created_at' | 'updated_at'>>;
export type LocationRetrievedDTO = Omit<locationsAttributes, ''>;

// Hive domain types
export type HiveDTO = Omit<hivesAttributes, 'hive_id' | 'created_at' | 'updated_at'>;

// Major Inspection domain types
export type MajorInspectionDTO = Omit<major_inspectionsAttributes, 'inspection_id' | 'created_at' | 'updated_at'>;

// Hive Inspection domain types
export type HiveInspectionDTO = Omit<hive_inspectionsAttributes, 'inspection_id' | 'created_at' | 'updated_at'>;
