// src/services/hiveService.ts

//import { hives, hivesAttributes } from '../database/models-ts/hives.js';
import { IHiveRepository } from '../repositories/interfaces/i-hive-repository.js'; // repositories/interfaces/i-hive-repository.js';
//import { HiveServiceCreateDTO, HiveServiceUpdateDTO, HiveServiceRetrievedDTO } from './dto/hive-service.dto.js';
//import { locations } from '../database/models-ts/locations.js';
import { HiveServiceCreateDTO, HiveServiceUpdateDTO, HiveServiceRetrievedDTO } from './dto/hive-service.dto.js';

export class HiveService {
  private _hiveRepository: IHiveRepository;

  constructor(private hiveRepository: IHiveRepository) {
    this._hiveRepository = hiveRepository;
  }

  // // TODO MODIFY METHODS TO USE REPOSITORY INSTEAD OF DIRECT MODEL ACCESS
  // /**
  //  * Retrieves all hives associated with a specific location, ensuring the location belongs to the user.
  //  * @param userId The ID of the authenticated user.
  //  * @param locationId The ID of the location to retrieve hives for.
  //  * @returns A promise that resolves to an array of hive objects.
  //  */
  // public static async getHivesByLocationId(locationId: string): Promise<hivesAttributes[]> {
  //   const hivesFound = await hives.findAll({
  //     where: {
  //       location_id: locationId,
  //     },
  //   });
  //   return hivesFound.map((hive) => hive.toJSON());
  // }
  
  // /**
  //  * Retrieves a single hive by its ID and location ID, ensuring the location belongs to the user.
  //  * @param locationId The ID of the parent location.
  //  * @param hiveId The ID of the hive to retrieve.
  //  * @returns A promise that resolves to the hive object or null if not found.
  //  */
  // public static async getHiveById(locationId: string, hiveId: string): Promise<hivesAttributes | null> {
  //   const hive = await hives.findOne({
  //     where: {
  //       hive_id: hiveId,
  //       location_id: locationId,
  //     },
  //   });
  //   return hive ? hive.toJSON() : null;
  // }

  /**
   * Creates a new hive for a given location.   
   * @param hiveData The data for the new hive.
   * @returns A promise that resolves to the newly created hive object.
   */
  public async createHive( hiveData: HiveServiceCreateDTO): Promise<HiveServiceRetrievedDTO> {
    console.log('Service Creating hive...',, hiveData);

    const newCreatedHive = await this._hiveRepository.create( hiveData);
    return newCreatedHive; //.toJSON();    
  }

  // // TODO MODIFY METHODS TO USE REPOSITORY INSTEAD OF DIRECT MODEL ACCESS
  // /**
  //  * Updates an existing hive.
  //  * @param locationId The ID of the parent location.
  //  * @param hiveId The ID of the hive to update.
  //  * @param updateData The data to update.
  //  * @returns A promise that resolves to the updated hive object or null if not found.
  //  */
  // public static async updateHive(locationId: string, hiveId: string, updateData: Partial<hivesAttributes>): Promise<hivesAttributes | null> {
  //   // Check if the hive exists and belongs to the user and location
  //   const hiveToUpdate = await HiveService.getHiveById(locationId, hiveId);

  //   if (!hiveToUpdate) {
  //     return null;
  //   }

  //   const [numberOfAffectedRows, affectedRows] = await hives.update(updateData, {
  //     where: { hive_id: hiveId },
  //     returning: true,
  //   });

  //   if (numberOfAffectedRows === 0) {
  //     return null;
  //   }

  //   return affectedRows[0].toJSON();
  // }

  // // TODO MODIFY METHODS TO USE REPOSITORY INSTEAD OF DIRECT MODEL ACCESS
  // /**
  //  * Deletes a hive by its ID and location ID, ensuring ownership.
  //  * @param locationId The ID of the parent location.
  //  * @param hiveId The ID of the hive to delete.
  //  * @returns A promise that resolves to a boolean indicating success.
  //  */
  // public static async deleteHive(locationId: string, hiveId: string): Promise<boolean> {
  //   console.log('Service (deleteHive) Deleting hive...', locationId, hiveId);
  //   // Find the hive first with the ownership checks
  //   const hiveToDelete = await hives.findOne({
  //     attributes: ['hive_id'],
  //     where: {
  //       hive_id: hiveId,
  //       location_id: locationId,
  //     },
  //     raw: true,
  //   });

  //   if (!hiveToDelete) {
  //     return false;
  //   }

  //   console.log('Service (deleteHive) Found hive to delete:', hiveToDelete);

  //   const deletedRows = await hives.destroy({
  //     where: {
  //       hive_id: hiveToDelete.hive_id,
  //     },
  //   });

  //   return deletedRows > 0;
  // }

  // TODO MODIFY METHODS TO USE REPOSITORY INSTEAD OF DIRECT MODEL ACCESS
  // /**
  //  * Deletes all hives by their location ID, ensuring ownership.
  //  * @param locationId The ID of the parent location.
  //  * @returns A promise that resolves to a boolean indicating success.
  //  */
  // public static async deleteAllHives(locationId: string): Promise<boolean> {
  //   const deletedRows = await hives.destroy({
  //     where: {
  //       location_id: locationId,
  //     },
  //   });

  //   return deletedRows > 0;
  // }
}
