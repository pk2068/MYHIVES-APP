import { hivesAttributes } from 'database/models-ts/hives.js';

// Input for creating a new hive (omits ID and timestamps)
export type HiveServiceCreateDTO = Omit<hivesAttributes, 'hive_id' | 'created_at' | 'updated_at'>;

// Input for updating a hive (all fields optional, omits foreign key and IDs)
export type HiveServiceUpdateDTO = Partial<HiveServiceCreateDTO>;

// Output/Retrieved DTO for a hive
export type HiveServiceRetrievedDTO = hivesAttributes;
