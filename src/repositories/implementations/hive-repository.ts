import { Sequelize } from 'sequelize';
import { IHiveRepository } from '../interfaces/i-hive-repository.js';
import { hives } from '../../database/models-ts/hives.js'; //'../ database/models-ts/hives.js';
import { HiveServiceCreateDTO, HiveServiceUpdateDTO, HiveServiceRetrievedDTO } from 'services/dto/hive-service.dto.js';

/**
 * Concrete Hive repository.
 *
 * Note: This file provides a pragmatic implementation using Prisma.
 * The exported instance is asserted to IHiveRepository to match your interface
 * even if the exact method signatures differ from this example.
 */
export class HiveRepository implements IHiveRepository {
  async create(hiveData: HiveServiceCreateDTO): Promise<HiveServiceRetrievedDTO> {
    const newHive = await hives.create(hiveData);
    return newHive as HiveServiceRetrievedDTO;
  }

  async update(id: string, hiveData: HiveServiceUpdateDTO): Promise<[number, HiveServiceRetrievedDTO[]]> {
    const [updatedCount, [updatedHive]] = await hives.update(hiveData, {
      where: { hive_id: id },
      returning: true,
    });
    return [updatedCount, updatedCount > 0 ? [updatedHive as HiveServiceRetrievedDTO] : []];
  }

  async findById(hiveId: string): Promise<HiveServiceRetrievedDTO | null> {
    const hive = await hives.findByPk(hiveId);
    //const otherWay = await hives.findAll({ where: { hive_id: hiveId } });
    return hive ? (hive as HiveServiceRetrievedDTO) : null;
  }

  async findAllByLocationId(locationId: string): Promise<HiveServiceRetrievedDTO[]> {
    const allHives = await hives.findAll({ where: { location_id: locationId } });
    return allHives as HiveServiceRetrievedDTO[];
  }

  async delete(id: string): Promise<number> {
    const deletedCount = await hives.destroy({ where: { hive_id: id } });
    return deletedCount;
  }
}
