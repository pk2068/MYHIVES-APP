import { AllMetadata, FullMetadataDTO, MetadataCategory, LookupItem } from '../../types/metadata-types.js';

export interface IMetaDataRepository {
  // Returns ONLY active metadata for the "New Inspection" form
  getActiveMetadata(): Promise<AllMetadata>;

  // Returns EVERYTHING (including disabled items) for the Admin Panel
  getAllMetadata(): Promise<AllMetadata>;

  // Creates records across all 4 tables (useful for seeding/initial setup)
  createMetadata(fullData: FullMetadataDTO): Promise<void>;

  // Replaces all records in a specific table with the new data provided.
  replaceAllByCategory(key: MetadataCategory, data: LookupItem[]): Promise<void>;

  // Deletes multiple records from a specific table
  deleteMetadata(key: MetadataCategory, ids: number[]): Promise<number>;

  // Sets is_active to false instead of deleting
  setMetadataStatus(key: MetadataCategory, id: number, isActive: boolean): Promise<void>;
}
