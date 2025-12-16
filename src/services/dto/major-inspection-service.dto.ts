import { major_inspectionsAttributes, Major_inspections } from 'database/models-ts/major-inspections.js';

export type MajorInspectionServiceCreateDTO = Omit<major_inspectionsAttributes, 'major_inspection_id' | 'created_at' | 'updated_at'>;
export type MajorInspectionServiceUpdateDTO = Partial<MajorInspectionServiceCreateDTO>;
export type MajorInspectionServiceRetrievedDTO = major_inspectionsAttributes;
