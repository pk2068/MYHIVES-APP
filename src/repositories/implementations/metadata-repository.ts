import { IMetaDataRepository } from '../interfaces/i-metadata-repository.js';
import { AllMetadata, FullMetadataDTO, MetadataCategory, LookupItem } from '../../types/metadata-types.js';
import { Varroa_treatments } from '../../database/models-ts/varroa-treatments.js';
import { Queen_statuses } from '../../database/models-ts/queen-statuses.js';
import { Queen_cell_statuses } from '../../database/models-ts/queen-cell-statuses.js';
import { Colony_health_statuses } from '../../database/models-ts/colony-health-statuses.js';
import { sequelizeInstance } from '../../database/connect.js'; // Assuming you have an exported sequelize instance

export class MetadataRepository implements IMetaDataRepository {
  // Map string keys to Sequelize Models
  private modelMap: Record<MetadataCategory, any> = {
    varroa_treatments: Varroa_treatments,
    queen_statuses: Queen_statuses,
    queen_cell_statuses: Queen_cell_statuses,
    colony_health_statuses: Colony_health_statuses,
  };

  // A mapping configuration to handle the naming differences
  private readonly config = {
    varroa_treatments: {
      model: Varroa_treatments,
      idAttr: 'treatment_id',
      nameAttr: 'treatment_name',
    },
    queen_statuses: {
      model: Queen_statuses,
      idAttr: 'status_id',
      nameAttr: 'status_name',
    },
    queen_cell_statuses: {
      model: Queen_cell_statuses,
      idAttr: 'status_id',
      nameAttr: 'status_name',
    },
    colony_health_statuses: {
      model: Colony_health_statuses,
      idAttr: 'status_id',
      nameAttr: 'status_name',
    },
  };

  async getAllMetadata(): Promise<AllMetadata> {
    const [varroa, queen, cells, health] = await Promise.all([
      Varroa_treatments.findAll({ attributes: ['status_id', 'name'], raw: true }),
      Queen_statuses.findAll({ attributes: ['status_id', 'name'], raw: true }),
      Queen_cell_statuses.findAll({ attributes: ['status_id', 'name'], raw: true }),
      Colony_health_statuses.findAll({ attributes: ['status_id', 'name'], raw: true }),
    ]);

    return {
      varroa_treatments: varroa as unknown as LookupItem[],
      queen_statuses: queen as unknown as LookupItem[],
      queen_cell_statuses: cells as unknown as LookupItem[],
      colony_health_statuses: health as unknown as LookupItem[],
    };
  }

  async createMetadata(fullData: FullMetadataDTO): Promise<void> {
    // Use a transaction to ensure all 4 tables are updated or none
    await sequelizeInstance.transaction(async (t) => {
      await Varroa_treatments.bulkCreate(fullData.varroa_treatments as unknown as Varroa_treatments[], { transaction: t });
      await Queen_statuses.bulkCreate(fullData.queen_statuses, { transaction: t });
      await Queen_cell_statuses.bulkCreate(fullData.queen_cell_statuses, { transaction: t });
      await Colony_health_statuses.bulkCreate(fullData.colony_health_statuses, { transaction: t });
    });
  }

  async addMetadata(key: MetadataCategory, data: LookupItem[]): Promise<void> {
    const model = this.modelMap[key];
    await model.bulkCreate(data);
  }

  async deleteMetadata(key: MetadataCategory, ids: number[]): Promise<number> {
    const model = this.modelMap[key];
    return await model.destroy({
      where: {
        status_id: ids,
      },
    });
  }
}
