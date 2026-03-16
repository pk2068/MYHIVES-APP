import { IMetaDataRepository } from '../repositories/interfaces/i-metadata-repository.js';
import { AllMetadata, FullMetadataDTO, MetadataCategory, LookupItem } from '../types/metadata-types.js';

export class MetadataService {
  private readonly _repository: IMetaDataRepository;

  constructor(repository: IMetaDataRepository) {
    this._repository = repository;
  }

  async getAllMetadata(): Promise<AllMetadata> {
    return this._repository.getAllMetadata();
  }

  async createMetadata(fullData: FullMetadataDTO): Promise<void> {
    return this._repository.createMetadata(fullData);
  }

  /**
   * Replaces all metadata for a given category. This is an atomic "delete all then insert all" operation.
   */
  async addMetadata(key: MetadataCategory, data: LookupItem[]): Promise<void> {
    return this._repository.replaceAllByCategory(key, data);
  }

  async deleteMetadata(key: MetadataCategory, ids: number[]): Promise<number> {
    return this._repository.deleteMetadata(key, ids);
  }
}
