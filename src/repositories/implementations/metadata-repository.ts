import { IMetaDataRepository } from '../interfaces/i-metadata-repository.js';
import { AllMetadata, FullMetadataDTO, MetadataCategory, LookupItem } from '../../types/metadata-types.js';
import { Varroa_treatments } from '../../database/models-ts/varroa-treatments.js';
import { Queen_statuses } from '../../database/models-ts/queen-statuses.js';
import { Queen_cell_statuses } from '../../database/models-ts/queen-cell-statuses.js';
import { Colony_health_statuses } from '../../database/models-ts/colony-health-statuses.js';
import { sequelizeInstance } from '../../database/connect.js'; // Assuming you have an exported sequelize instance

export class MetadataRepository implements IMetaDataRepository {
  // A mapping configuration to handle the naming differences
  private readonly configMeta = {
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
    const { varroa_treatments, queen_statuses, queen_cell_statuses, colony_health_statuses } = this.configMeta;

    // Helper to fetch and map data for a given metadata category
    const fetchData = async (configItem: (typeof this.configMeta)[MetadataCategory]): Promise<LookupItem[]> => {
      const items = await (configItem.model as any).findAll({
        attributes: [configItem.idAttr, configItem.nameAttr],
        raw: true,
      });
      // Safely map the raw data to the LookupItem structure, avoiding unsafe casting.
      return items.map((item: any) => ({
        id: item[configItem.idAttr],
        name: item[configItem.nameAttr],
      }));
    };

    const [varroa, queen, cells, health] = await Promise.all([
      fetchData(varroa_treatments),
      fetchData(queen_statuses),
      fetchData(queen_cell_statuses),
      fetchData(colony_health_statuses),
    ]);

    return {
      varroa_treatments: varroa,
      queen_statuses: queen,
      queen_cell_statuses: cells,
      colony_health_statuses: health,
    };
  }

  async createMetadata(fullData: FullMetadataDTO): Promise<void> {
    // Use a transaction to ensure all 4 tables are updated or none
    await sequelizeInstance.transaction(async (t) => {
      const creationPromises = (Object.keys(this.configMeta) as MetadataCategory[]).map((key) => {
        const configItem = this.configMeta[key];
        const itemsToCreate = fullData[key].map((item) => ({
          [configItem.idAttr]: item.id,
          [configItem.nameAttr]: item.name,
        }));
        // Cast to any is needed here because TypeScript cannot dynamically match
        // the mapped keys to the specific model's attributes.
        return (configItem.model as any).bulkCreate(itemsToCreate, { transaction: t });
      });

      await Promise.all(creationPromises);
    });
  }

  async replaceAllByCategory(key: MetadataCategory, data: LookupItem[]): Promise<void> {
    await sequelizeInstance.transaction(async (t) => {
      await this.deleteAllByCategory(key, { transaction: t });
      if (data.length > 0) {
        await this.addMetadata(key, data, { transaction: t });
      }
    });
  }

  private async addMetadata(key: MetadataCategory, data: LookupItem[], options?: { transaction: any }): Promise<void> {
    const configItem = this.configMeta[key];
    const itemsToCreate = data.map((item) => ({
      [configItem.idAttr]: item.id,
      [configItem.nameAttr]: item.name,
    }));
    await (configItem.model as any).bulkCreate(itemsToCreate, options);
  }

  async deleteMetadata(key: MetadataCategory, ids: number[]): Promise<number> {
    const configItem = this.configMeta[key];
    const idColumn = configItem.idAttr;

    return await (configItem.model as any).destroy({
      where: {
        [idColumn]: ids,
      },
    });
  }

  private async deleteAllByCategory(key: MetadataCategory, options?: { transaction: any }): Promise<number> {
    const configItem = this.configMeta[key];
    // Using truncate is more efficient for deleting all rows in a table.
    return await (configItem.model as any).destroy({
      where: {},
      truncate: true,
      ...options,
    });
  }
}
