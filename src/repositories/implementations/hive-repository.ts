import { Sequelize } from 'sequelize';
import { IHiveRepository } from '../interfaces/i-hive-repository.js';
import { Hives } from '../../database/models-ts/hives.js'; //'../ database/models-ts/hives.js';
import { HiveServiceCreateDTO, HiveServiceUpdateDTO, HiveServiceRetrievedDTO } from 'services/dto/hive-service.dto.js';

/**
 * Concrete Hive repository.
 *
 * Note: This file provides a pragmatic implementation using Prisma.
 * The exported instance is asserted to IHiveRepository to match your interface
 * even if the exact method signatures differ from this example.
 */
export class HiveRepository implements IHiveRepository {
  private readonly db: Sequelize; // Dependency for Sequelize instance (for transactions)

  constructor(db: Sequelize) {
    this.db = db;
  }

  async create(hiveData: HiveServiceCreateDTO): Promise<HiveServiceRetrievedDTO> {
    const newHive = await Hives.create(hiveData);
    return newHive as HiveServiceRetrievedDTO;
  }

  async update(id: string, hiveData: HiveServiceUpdateDTO): Promise<[number, HiveServiceRetrievedDTO[]]> {
    return this.db.transaction(async (t) => {
      const [updatedCount, [updatedHive]] = await Hives.update(hiveData, {
        where: { hive_id: id },
        returning: true,
      });
      return [updatedCount, updatedCount > 0 ? [updatedHive as HiveServiceRetrievedDTO] : []];
    });
  }

  async findById(hiveId: string, locationId?: string): Promise<HiveServiceRetrievedDTO | null> {
    if (locationId) {
      const hiveWithLocation = await Hives.findOne({
        where: {
          hive_id: hiveId,
          location_id: locationId,
        },
      });
      return hiveWithLocation ? (hiveWithLocation as HiveServiceRetrievedDTO) : null;
    } else {
      const hive = await Hives.findByPk(hiveId);
      return hive ? (hive as HiveServiceRetrievedDTO) : null;
    }
  }

  async findAllByLocationId(locationId: string): Promise<HiveServiceRetrievedDTO[]> {
    const allHives = await Hives.findAll({ where: { location_id: locationId } });
    return allHives as HiveServiceRetrievedDTO[];
  }

  async delete(id: string, locationId?: string): Promise<number> {
    const whereCondition = locationId ? { hive_id: id, location_id: locationId } : { hive_id: id };

    const deletedCount: number = await Hives.destroy({ where: whereCondition });
    return deletedCount;
  }

  async deleteAll(locationId: string): Promise<number> {
    const deletedCount: number = await Hives.destroy({ where: { location_id: locationId } });
    return deletedCount;
  }
}
