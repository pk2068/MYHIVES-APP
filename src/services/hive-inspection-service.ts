import { hive_inspectionsAttributes } from 'database/models-ts/hive_inspections.js';
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

  public async getHiveInspectionById(inspectionId: string, majorInspection?: string): Promise<HiveInspectionServiceRetrievedDTO | null> {
    const inspection = await this._hiveInspectionRepository.findById(inspectionId);
    return inspection;
  }

  public async updateHiveInspection(inspectionId: string, updateData: HiveInspectionServiceUpdateDTO): Promise<HiveInspectionServiceRetrievedDTO | null> {
    const [numberOfAffectedRows, affectedRows] = await this._hiveInspectionRepository.update(inspectionId, updateData);

    if (numberOfAffectedRows === 0) {
      return null;
    }
    // The repository returns the updated record(s), we return the first one.
    return affectedRows[0];
  }

  /**
   * Deletes a hive inspection, requiring the hiveId for scoping/ownership.
   * @param inspectionId The ID of the inspection to delete.
   * @param majorInspectionId The ID of the parent major inspection.
   * @param locationId The ID of the location for ownership verification.
   * @param userId The ID of the user attempting the deletion.
   * @param hiveId (Optional) The ID of the hive for extra ownership verification.
   * @returns True if the inspection was deleted (deletedRows > 0), false otherwise.
   */
  public async deleteHiveInspection(inspectionId: string, majorInspectionId: string, locationId: string, userId: string, hiveId?: string): Promise<boolean> {
    // is the user authorized to delete this inspection on this hive?

    const inspection = await this._hiveInspectionRepository.findHiveInspectionByMajorInspectionLocationAndUser(inspectionId, majorInspectionId, locationId, userId);
    if (!inspection) {
      return false;
    }

    if (hiveId && inspection.hive_id !== hiveId) return false; // double check the hiveId if provided, for extra safety
    // The repository handles the deletion logic.
    const deletedRows = await this._hiveInspectionRepository.delete(inspectionId);

    return deletedRows > 0;
  }

  // ------------------------------------------------------------------
  // NEW: Get all Hive Inspections for a Major Inspection, with Security
  // ------------------------------------------------------------------
  public async getHiveInspectionsByMajorInspectionId(majorInspectionId: string, locationId: string, userId: string): Promise<HiveInspectionServiceRetrievedDTO[] | null> {
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
   * Checks if a Hive Inspection is owned by the user through the ownership chain.
   * Location → MajorInspection → HiveInspection
   * @returns True if the user owns this inspection, false otherwise.
   */
  public async checkHiveInspectionOwnership(hiveInspectionId: string, majorInspectionId: string, locationId: string, userId: string): Promise<boolean> {
    // Use the repo's JOIN-based method to verify the entire ownership chain
    const inspection = await this._hiveInspectionRepository.findHiveInspectionByMajorInspectionLocationAndUser(hiveInspectionId, majorInspectionId, locationId, userId);
    return inspection !== null;
  }

  /**
   * Checks if a user owns a specific hive inspection in a hive history context.
   * Location → Hive → HiveInspection
   * Used by middleware for history-based authorization.
   */
  public async checkHiveInspectionOwnershipInHive(inspectionId: string, hiveId: string, locationId: string, userId: string): Promise<boolean> {
    const inspection = await this._hiveInspectionRepository.findHiveInspectionByHiveLocationAndUser(inspectionId, hiveId, locationId, userId);
    return inspection !== null;
  }

  // ======================================================================
  // HIVE HISTORY CONTEXT - Analytical queries for hive development
  // (Can be extended with future routes: /hives/:hiveId/inspections)
  // ======================================================================

  /**
   * Gets all historical inspections for a specific hive.
   * for hive development trends and health analysis.
   */
  public async getHiveInspectionHistory(hiveId: string, locationId: string, userId: string): Promise<HiveInspectionServiceRetrievedDTO[] | null> {
    const inspections = await this._hiveInspectionRepository.findAllByHiveId(hiveId);
    return inspections;
  }

  public async getHiveInspectionHistoryByDateRange(
    hiveId: string,
    //locationId: string,
    //userId: string,
    startDate: string,
    endDate?: string
  ): Promise<HiveInspectionServiceRetrievedDTO[] | null> {
    let endDate1: Date;
    if (!endDate) endDate1 = new Date();
    else {
      const endDateTemp = new Date(endDate);
      if (isNaN(endDateTemp.getTime())) {
        throw new Error('Invalid end date');
      }
      endDate1 = endDateTemp;
    }

    let startDate1: Date;
    if (startDate === '') {
      startDate1 = new Date(new Date().getFullYear() - 1, 0, 1); // Default to start of last year
    } else {
      const startDateTemp = new Date(startDate);
      if (isNaN(startDateTemp.getTime())) {
        throw new Error('Invalid start date');
      }
      startDate1 = startDateTemp;
    }

    const inspections = await this._hiveInspectionRepository.findAllByHiveIdAndDateRange(hiveId, startDate1, endDate1);
    return inspections;
  }
}
