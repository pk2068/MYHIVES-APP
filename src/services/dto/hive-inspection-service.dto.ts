import { hive_inspectionsAttributes } from 'database/models-ts/hive_inspections.js';
import { major_inspectionsAttributes } from 'database/models-ts/major-inspections.js';

export type HiveInspectionServiceCreateDTO = Omit<hive_inspectionsAttributes, 'hive_inspection_id' | 'created_at' | 'updated_at'>;
export type HiveInspectionServiceUpdateDTO = Partial<
  Omit<HiveInspectionServiceRetrievedDTO, 'hive_inspection_id' | 'hive_id' | 'major_inspection_id' | 'created_at' | 'updated_at'>
>;

export type HiveInspectionServiceRetrievedDTO = hive_inspectionsAttributes & { major_inspection?: major_inspectionsAttributes };
