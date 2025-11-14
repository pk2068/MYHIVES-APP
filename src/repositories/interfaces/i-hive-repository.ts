import { HiveServiceCreateDTO, HiveServiceUpdateDTO, HiveServiceRetrievedDTO } from 'services/dto/hive-service.dto.js';

/**
 * Interface for the Hive data access layer.
 * Manages CRUD operations for the 'hives' table.
 */
export interface IHiveRepository {
  /**
   * Creates a new hive record.
   * @param hive The data for the new hive, including the location_id.
   * @returns The created hive DTO.
   */
  create(hive: HiveServiceCreateDTO): Promise<HiveServiceRetrievedDTO>;

  /**
   * Updates an existing hive record.
   * @param id The unique ID of the hive to update.
   * @param hive The partial update data.
   * @returns A tuple: [number of updated rows (should be 1), array of updated hive DTOs].
   */
  update(id: string, hive: HiveServiceUpdateDTO): Promise<[number, HiveServiceRetrievedDTO[]]>;

  /**
   * Retrieves a single hive by its ID.
   * @param hiveId The unique ID of the hive.
   * @param locationId The optional unique ID of the location.
   * @returns The hive DTO or null if not found.
   */
  findById(hiveId: string, locationId?: string): Promise<HiveServiceRetrievedDTO | null>;

  /**
   * Retrieves all hives associated with a specific location.
   * @param locationId The ID of the location.
   * @returns An array of hive DTOs.
   */
  findAllByLocationId(locationId: string): Promise<HiveServiceRetrievedDTO[]>;

  /**
   * Deletes a hive record by its ID.
   * @param hiveId The unique ID of the hive to delete.
   * @param locationId The optional unique ID of the location.
   * @returns The number of records deleted (should be 1 or 0).
   */
  delete(hiveId: string, locationId?: string): Promise<number>;

  /**
   * Deletes a hive record by its ID.
   * @param locationId The unique ID of the location.
   * @returns The number of records deleted (should be 1 or 0).
   */
  deleteAll(locationId: string): Promise<number>;
}
