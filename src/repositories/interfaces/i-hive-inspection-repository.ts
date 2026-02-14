// src/repositories/interfaces/i-hive-inspection-repository.ts

import { HiveInspectionServiceCreateDTO, HiveInspectionServiceRetrievedDTO, HiveInspectionServiceUpdateDTO } from '../../services/dto/hive-inspection-service.dto.js';

/**
 * Defines the contract for all data access operations related to Hive Inspections.
 * This interface is crucial for implementing the Dependency Injection pattern.
 */
export interface IHiveInspectionRepository {
  /**
   * Creates a new hive inspection record.
   * @param inspection The data for the new hive inspection.
   * @returns The created hive inspection DTO.
   */
  create(inspection: HiveInspectionServiceCreateDTO): Promise<HiveInspectionServiceRetrievedDTO>;

  /**
   * Updates an existing hive inspection record.
   * @param inspectionId The ID of the inspection to update.
   * @param hiveId The ID of the hive the inspection belongs to (for security/scoping).
   * @param inspection The data to update.
   * @returns A tuple [number of affected rows, array of updated records].
   */
  update(inspectionId: string, hiveId: string, inspection: HiveInspectionServiceUpdateDTO): Promise<[number, HiveInspectionServiceRetrievedDTO[]]>;

  /**
   * Finds a specific hive inspection by its ID.
   * @param inspectionId The ID of the inspection.
   * @param majorInspectionId Optional: The ID of the major inspection
   * @returns The inspection DTO or null if not found.
   */
  findById(inspectionId: string, majorInspectionId?: string): Promise<HiveInspectionServiceRetrievedDTO | null>;

  /**
   * Finds all hive inspections for a specific hive.
   * @param hiveId The ID of the hive.
   * @returns An array of inspection DTOs.
   */
  findAllByHiveId(hiveId: string): Promise<HiveInspectionServiceRetrievedDTO[]>;

  /**
   * Finds all hive inspections for a specific major-inspection.
   * @param majorInspectionId The ID of the major inspection.
   * @returns An array of hive-inspection DTOs.
   */
  findAllByMajorInspectionId(majorInspectionId: string): Promise<HiveInspectionServiceRetrievedDTO[]>;

  /**
   * Deletes a hive inspection record.
   * @param inspectionId The ID of the inspection to delete.
   * @param hiveId Optional: The ID of the hive (for scoped deletion).
   * @returns The number of destroyed rows (1 for success, 0 for failure).
   */
  delete(inspectionId: string, hiveId?: string): Promise<number>;

  /**
   * CRITICAL: Checks for ownership via INNER JOINs.
   * Verifies the Hive Inspection exists, belongs to a specific Major Inspection,
   * and that Major Inspection belongs to a Location owned by the user.
   * @param hiveInspectionId The ID of the inspection.
   * @param majorInspectionId The ID of the major inspection.
   * @param locationId The ID of the location.
   * @param userId The ID of the owning user.
   * @returns The inspection DTO if owned and exists, otherwise null.
   */
  findHiveInspectionByMajorInspectionLocationAndUser(
    hiveInspectionId: string,
    majorInspectionId: string,
    locationId: string,
    userId: string
  ): Promise<HiveInspectionServiceRetrievedDTO | null>;
}
