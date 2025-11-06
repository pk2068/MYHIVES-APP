import { hivesAttributes } from '../../../database/models-ts/hives.js';
import { major_inspectionsAttributes } from '../../../database/models-ts/major-inspections.js';
import { hive_inspectionsAttributes } from '../../../database/models-ts/hive_inspections.js';

// Hive domain types
export type HiveDTO = Omit<hivesAttributes, 'hive_id' | 'created_at' | 'updated_at'>;

// Major Inspection domain types
export type MajorInspectionDTO = Omit<major_inspectionsAttributes, 'inspection_id' | 'created_at' | 'updated_at'>;

// Hive Inspection domain types
export type HiveInspectionDTO = Omit<hive_inspectionsAttributes, 'inspection_id' | 'created_at' | 'updated_at'>;
