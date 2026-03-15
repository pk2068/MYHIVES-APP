import { AllMetadata, FullMetadataDTO, MetadataCategory, LookupItem } from '../../types/metadata-types.js';

export interface IMetaDataRepository {
  getAllMetadata(): Promise<AllMetadata>;

  // Creates records across all 4 tables (useful for seeding/initial setup)
  createMetadata(fullData: FullMetadataDTO): Promise<void>;

  // Adds records to a specific table based on the key
  addMetadata(key: MetadataCategory, data: LookupItem[]): Promise<void>;

  // Deletes multiple records from a specific table
  deleteMetadata(key: MetadataCategory, ids: number[]): Promise<number>;
}
