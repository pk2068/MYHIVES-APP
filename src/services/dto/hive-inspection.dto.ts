import { hive_inspectionsAttributes } from 'database/models-ts/hive_inspections.js';

export type HiveInspectionServiceCreateDTO = Omit<hive_inspectionsAttributes, 'hive_inspection_id' | 'created_at' | 'updated_at'>;
export type HiveInspectionServiceUpdateDTO = Partial<HiveInspectionServiceCreateDTO>;
export type HiveInspectionServiceRetrievedDTO = hive_inspectionsAttributes;
