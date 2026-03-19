import { IMetaDataRepository } from '../repositories/interfaces/i-metadata-repository.js';
import { AllMetadata, FullMetadataDTO, MetadataCategory, LookupItem } from '../types/metadata-types.js';

export class MetadataService {
  private readonly _repository: IMetaDataRepository;

  constructor(repository: IMetaDataRepository) {
    this._repository = repository;
  }

  /**
   * Retrieves all metadata, including inactive items.
   * Intended for admin panels where all items need to be visible.
   */
  async getAllMetadata(): Promise<AllMetadata> {
    return this._repository.getAllMetadata();
  }

  /**
   * Retrieves only the active metadata items.
   * Intended for populating dropdowns in user-facing forms.
   */
  async getActiveMetadata(): Promise<AllMetadata> {
    return this._repository.getActiveMetadata();
  }

  async createMetadata(fullData: FullMetadataDTO): Promise<void> {
    return this._repository.createMetadata(fullData);
  }

  /**
   * Replaces all metadata for a given category. This is a "delete all then insert all" operation.
   */
  async addMetadata(key: MetadataCategory, data: LookupItem[]): Promise<void> {
    return this._repository.replaceAllByCategory(key, data);
  }

  /**
   * Performs a hard delete on metadata items.
   * @warning This will fail if the item is referenced by a foreign key (e.g., in a hive inspection).
   * Use `setMetadataStatus` for a safe "soft delete".
   */
  async deleteMetadata(key: MetadataCategory, ids: number[]): Promise<number> {
    return this._repository.deleteMetadata(key, ids);
  }

  /**
   * Sets the `is_active` status for a metadata item. This is the preferred way to "delete"
   * an item that may be in use, as it preserves foreign key integrity.
   * @param key The metadata category (e.g., 'varroa_treatments').
   * @param id The ID of the item to update.
   * @param isActive The new status (true for active, false for inactive).
   */
  async setMetadataStatus(key: MetadataCategory, id: number, isActive: boolean): Promise<void> {
    return this._repository.setMetadataStatus(key, id, isActive);
  }
}
