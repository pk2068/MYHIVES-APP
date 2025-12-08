// src/services/hive-inspection-service.ts

import { IHiveInspectionRepository } from '../repositories/interfaces/i-hive-inspection-repository.js';
import { MajorInspectionService } from './major-inspection-service.js';
import { HiveInspectionServiceCreateDTO, HiveInspectionServiceRetrievedDTO, HiveInspectionServiceUpdateDTO } from './dto/hive-inspection-service.dto.js';

export class HiveInspectionService {
  // Dependency Injection: Injecting the repository contract
  private _hiveInspectionRepository: IHiveInspectionRepository;
  private _majorInspectionService: MajorInspectionService; // To be set via a setter or constructor parameter

  /**
   * Initializes the HiveInspectionService with a concrete repository implementation.
   * @param hiveInspectionRepository The repository instance.
   * @param majorInspectionService The major inspection service instance.
   */
  public constructor(hiveInspectionRepository: IHiveInspectionRepository, majorInspectionService: MajorInspectionService) {
    this._hiveInspectionRepository = hiveInspectionRepository;
    this._majorInspectionService = majorInspectionService;
  }

  public async createHiveInspection(inspectionData: HiveInspectionServiceCreateDTO): Promise<HiveInspectionServiceRetrievedDTO> {
    // The repository handles the data persistence details.
    const newInspection = await this._hiveInspectionRepository.create(inspectionData);
    return newInspection;
  }

  public async getHiveInspectionsByHiveId(hiveId: string): Promise<HiveInspectionServiceRetrievedDTO[]> {
    const inspections = await this._hiveInspectionRepository.findAllByHiveId(hiveId);
    return inspections;
  }

  public async getHiveInspectionById(inspectionId: string, hiveId: string): Promise<HiveInspectionServiceRetrievedDTO | null> {
    const inspection = await this._hiveInspectionRepository.findById(inspectionId, hiveId);
    return inspection;
  }

  public async updateHiveInspection(
    inspectionId: string,
    hiveId: string,
    updateData: HiveInspectionServiceUpdateDTO
  ): Promise<HiveInspectionServiceRetrievedDTO | null> {
    const [numberOfAffectedRows, affectedRows] = await this._hiveInspectionRepository.update(inspectionId, hiveId, updateData);

    if (numberOfAffectedRows === 0) {
      return null;
    }
    // The repository returns the updated record(s), we return the first one.
    return affectedRows[0];
  }

  /**
   * Deletes a hive inspection, requiring the hiveId for scoping/ownership.
   * @param inspectionId The ID of the inspection to delete.
   * @param hiveId The ID of the parent hive.
   * @returns True if the inspection was deleted (deletedRows > 0), false otherwise.
   */
  public async deleteHiveInspection(inspectionId: string, hiveId: string, userId: string): Promise<boolean> {
    // is the user authorized to delete this inspection on this hive?

    const inspection = await this._hiveInspectionRepository.findHiveInspectionByHiveAndUser(inspectionId, hiveId, userId);
    if (!inspection) {
      return false;
    }
    // The repository handles the deletion logic.
    const deletedRows = await this._hiveInspectionRepository.delete(inspectionId, hiveId);

    return deletedRows > 0;
  }

  // ------------------------------------------------------------------
  // NEW: Get all Hive Inspections for a Major Inspection, with Security
  // ------------------------------------------------------------------
  public async getHiveInspectionsByMajorInspectionId(
    majorInspectionId: string,
    locationId: string,
    userId: string
  ): Promise<HiveInspectionServiceRetrievedDTO[] | null> {
    // 1. Security Gate: Check if the Major Inspection is owned by the user/location
    const isOwned = await this._majorInspectionService.checkMajorInspectionOwnership(majorInspectionId, locationId, userId);

    if (!isOwned) {
      // If the Major Inspection is not owned (or doesn't exist under this location/user),
      // we stop here and return null to prevent access.
      return null;
    }

    // 2. Data Fetch: If ownership is confirmed, fetch all associated Hive Inspections.
    const inspections: HiveInspectionServiceRetrievedDTO[] = await this._hiveInspectionRepository.findAllByMajorInspectionId(majorInspectionId);
    //const inspections = await this._hiveInspectionRepository.findAllByMajorInspectionId(majorInspectionId);

    return inspections;
  }

  /**
   * Checks if a Hive Inspection exists at a specific Hive owned by a specific User.
   * This is a crucial security check typically used by middleware/controllers.
   */
  public async checkHiveInspectionOwnership(inspectionId: string, hiveId: string, userId: string): Promise<boolean> {
    // Delegates the triple-check to the Repository for a single, efficient database query.
    const inspection = await this._hiveInspectionRepository.findHiveInspectionByHiveAndUser(inspectionId, hiveId, userId);
    return inspection !== null;
  }
}
