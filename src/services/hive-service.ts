// src/services/hiveService.ts

//import { hives, hivesAttributes } from '../database/models-ts/hives.js';
import { IHiveRepository } from '../repositories/interfaces/i-hive-repository.js'; // repositories/interfaces/i-hive-repository.js';
import { HiveInspectionServiceRetrievedDTO } from './dto/hive-inspection-service.dto.js';
//import { HiveServiceCreateDTO, HiveServiceUpdateDTO, HiveServiceRetrievedDTO } from './dto/hive-service.dto.js';
//import { locations } from '../database/models-ts/locations.js';
import { HiveServiceCreateDTO, HiveServiceUpdateDTO, HiveServiceRetrievedDTO } from './dto/hive-service.dto.js';

export class HiveService {
  private _hiveRepository: IHiveRepository;

  constructor(private hiveRepository: IHiveRepository) {
    this._hiveRepository = hiveRepository;
  }

  // TODO MODIFY METHODS TO USE REPOSITORY INSTEAD OF DIRECT MODEL ACCESS
  /**
   * Retrieves all hives associated with a specific location, ensuring the location belongs to the user.
   * @param locationId The ID of the location to retrieve hives for.
   * @returns A promise that resolves to an array of hive objects.
   */
  public async getHivesByLocationId(locationId: string): Promise<HiveServiceRetrievedDTO[]> {
    const hivesFound: HiveServiceRetrievedDTO[] = await this._hiveRepository.findAllByLocationId(locationId); //  .findAll({

    return hivesFound;
  }

  /**
   * Retrieves a single hive by its ID and location ID, ensuring the location belongs to the user.
   * @param locationId The ID of the parent location.
   * @param hiveId The ID of the hive to retrieve.
   * @returns A promise that resolves to the hive object or null if not found.
   */
  public async getHiveById(locationId: string, hiveId: string): Promise<HiveServiceRetrievedDTO | null> {
    const hive = await this._hiveRepository.findById(hiveId, locationId); // .findOne({

    return hive ? hive : null;
  }

  /**
   * Creates a new hive for a given location.
   * @param hiveData The data for the new hive.
   * @returns A promise that resolves to the newly created hive object.
   */
  public async createHive(hiveData: HiveServiceCreateDTO): Promise<HiveServiceRetrievedDTO> {
    console.log('Service Creating hive...', hiveData);

    const newCreatedHive = await this._hiveRepository.create(hiveData);
    return newCreatedHive; //.toJSON();
  }

  /**
   * Updates an existing hive.
   * @param hiveId The ID of the hive to update.
   * @param updateData The data to update.
   * @returns A promise that resolves to the updated hive object or null if not found.
   */
  public async updateHive(hiveId: string, updateData: HiveServiceUpdateDTO): Promise<HiveServiceRetrievedDTO | null> {
    // Check if the hive exists and belongs to the user and location
    const hiveToUpdate = await this._hiveRepository.findById(hiveId);

    if (!hiveToUpdate) {
      return null;
    }

    const [numberOfAffectedRows, affectedRows] = await this._hiveRepository.update(hiveId, updateData);

    if (numberOfAffectedRows === 0) {
      return null;
    }

    return affectedRows[0];
  }

  /**
   * Deletes a hive by its ID and location ID, ensuring ownership.
   * @param locationId The ID of the parent location.
   * @param hiveId The ID of the hive to delete.
   * @returns A promise that resolves to a boolean indicating success.
   */
  public async deleteHive(locationId: string, hiveId: string): Promise<boolean> {
    console.log('Service (deleteHive) Deleting hive...', locationId, hiveId);

    // if the location is given, the Hive ID must belong to that Location
    const hiveToDelete = await this._hiveRepository.findById(hiveId, locationId);

    if (!hiveToDelete) {
      return false;
    }

    console.log('Service (deleteHive) Found hive to delete:', hiveToDelete);

    const deletedRows = await this.hiveRepository.delete(hiveId, locationId);

    return deletedRows > 0;
  }

  /**
   * Deletes all hives by their location ID, ensuring ownership.
   * @param locationId The ID of the parent location.
   * @returns A promise that resolves to a boolean indicating success.
   */
  public async deleteAllHives(locationId: string): Promise<boolean> {
    const deletedRows = await this._hiveRepository.deleteAll(locationId);

    return deletedRows > 0;
  }
}
