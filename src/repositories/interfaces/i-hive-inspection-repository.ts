import { HiveInspectionServiceCreateDTO, HiveInspectionServiceRetrievedDTO, HiveInspectionServiceUpdateDTO } from '../../services/dto/hive-inspection-service.dto.js';

/**
 * Core CRUD operations for Hive Inspections.
 * Minimal interface for basic data persistence operations.
 */
export interface IHiveInspectionCRUD {
  create(inspection: HiveInspectionServiceCreateDTO): Promise<HiveInspectionServiceRetrievedDTO>;

  findById(inspectionId: string): Promise<HiveInspectionServiceRetrievedDTO | null>;

  update(inspectionId: string, inspection: HiveInspectionServiceUpdateDTO): Promise<[number, HiveInspectionServiceRetrievedDTO[]]>;

  delete(inspectionId: string): Promise<number>;
}

/**
 * Query operations scoped by Major Inspection context.
 * Used when working within a major inspection event.
 */
export interface IHiveInspectionMajorInspectionQueries {
  /**
   * Finds a hive inspection within a specific major inspection.
   */
  findByIdInMajorInspection(inspectionId: string, majorInspectionId: string): Promise<HiveInspectionServiceRetrievedDTO | null>;

  /**
   * Finds all hive inspections for a specific major inspection.
   */
  findAllByMajorInspectionId(majorInspectionId: string): Promise<HiveInspectionServiceRetrievedDTO[]>;

  /**
   * Updates a hive inspection within a major inspection context.
   */
  updateInMajorInspection(inspectionId: string, majorInspectionId: string, inspection: HiveInspectionServiceUpdateDTO): Promise<[number, HiveInspectionServiceRetrievedDTO[]]>;

  /**
   * Deletes a hive inspection within a major inspection context.
   */
  deleteInMajorInspection(inspectionId: string, majorInspectionId: string): Promise<number>;
}

/**
 * Query operations scoped by Hive context.
 * Used for hive history, trending, and analysis across multiple inspections.
 */
export interface IHiveInspectionHiveHistoryQueries {
  /**
   * Finds all inspections for a specific hive.
   * Useful for historical trending and analysis.
   */
  findAllByHiveId(hiveId: string): Promise<HiveInspectionServiceRetrievedDTO[]>;

  /**
   * Finds all inspections for a specific hive within a date range.
   * Used for time-series analysis and health trending.
   */
  findAllByHiveIdAndDateRange(hiveId: string, startDate: Date, endDate: Date): Promise<HiveInspectionServiceRetrievedDTO[]>;

  /**
   * Updates an inspection in hive history context.
   */
  updateInHive(inspectionId: string, hiveId: string, inspection: HiveInspectionServiceUpdateDTO): Promise<[number, HiveInspectionServiceRetrievedDTO[]]>;

  /**
   * Deletes an inspection in hive history context.
   */
  deleteInHive(inspectionId: string, hiveId: string): Promise<number>;
}

/**
 * Security/Ownership verification operations.
 * Handles authorization checks for different contexts.
 */
export interface IHiveInspectionSecurityQueries {
  /**
   * Verifies ownership through the Major Inspection → Location chain.
   * Used by middleware in major-inspection routes.
   */
  findHiveInspectionByMajorInspectionLocationAndUser(
    hiveInspectionId: string,
    majorInspectionId: string,
    locationId: string,
    userId: string
  ): Promise<HiveInspectionServiceRetrievedDTO | null>;

  /**
   * Verifies ownership through the Hive → Location chain.
   * Used by middleware in hive routes.
   */
  findHiveInspectionByHiveLocationAndUser(inspectionId: string, hiveId: string, locationId: string, userId: string): Promise<HiveInspectionServiceRetrievedDTO | null>;
}

/**
 * Complete repository interface combining all operations.
 * Implemented by the concrete HiveInspectionRepository class.
 */
export interface IHiveInspectionRepository extends IHiveInspectionCRUD, IHiveInspectionMajorInspectionQueries, IHiveInspectionHiveHistoryQueries, IHiveInspectionSecurityQueries {}
