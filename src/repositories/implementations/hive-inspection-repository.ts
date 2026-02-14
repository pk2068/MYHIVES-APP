// src/repositories/implementations/hive-inspection-repository.ts

import { Sequelize } from 'sequelize';
import { IHiveInspectionRepository } from '../interfaces/i-hive-inspection-repository.js';
import { Hive_inspections } from '../../database/models-ts/hive_inspections.js';
import { Major_inspections } from '../../database/models-ts/major-inspections.js';
import { Hives } from '../../database/models-ts/hives.js'; // Needed for ownership check
import { Locations } from '../../database/models-ts/locations.js';
import { HiveInspectionServiceCreateDTO, HiveInspectionServiceRetrievedDTO, HiveInspectionServiceUpdateDTO } from '../../services/dto/hive-inspection-service.dto.js';

/**
 * Concrete implementation of the IHiveInspectionRepository using Sequelize.
 */
export class HiveInspectionRepository implements IHiveInspectionRepository {
  private readonly db: Sequelize; // Used for transactions

  constructor(db: Sequelize) {
    this.db = db;
  }

  async create(inspection: HiveInspectionServiceCreateDTO): Promise<HiveInspectionServiceRetrievedDTO> {
    const newInspection = await Hive_inspections.create(inspection as any); // Cast as any to resolve potential DTO/Model mismatch
    return newInspection.toJSON() as HiveInspectionServiceRetrievedDTO;
  }

  async update(inspectionId: string, hiveId: string, inspection: HiveInspectionServiceUpdateDTO): Promise<[number, HiveInspectionServiceRetrievedDTO[]]> {
    return this.db.transaction(async (t) => {
      const [updatedCount, updatedInspections] = await Hive_inspections.update(inspection, {
        where: { hive_inspection_id: inspectionId, hive_id: hiveId },
        returning: true,
        transaction: t,
      });
      // Sequelize returns model instances, map them to DTOs
      const dtos = updatedInspections.map((insp) => insp.toJSON() as HiveInspectionServiceRetrievedDTO);
      return [updatedCount, dtos];
    });
  }

  async findById(inspectionId: string, majorInspectionId?: string): Promise<HiveInspectionServiceRetrievedDTO | null> {
    const whereClause = majorInspectionId ? { hive_inspection_id: inspectionId, major_inspection_id: majorInspectionId } : { hive_inspection_id: inspectionId };

    const inspection = await Hive_inspections.findOne({
      where: whereClause,
    });
    return inspection ? (inspection.toJSON() as HiveInspectionServiceRetrievedDTO) : null;
  }

  async findAllByHiveId(hiveId: string): Promise<HiveInspectionServiceRetrievedDTO[]> {
    const allInspections = await Hive_inspections.findAll({
      where: { hive_id: hiveId },
      order: [['inspection_date', 'DESC']], // Assuming you want them ordered by date
    });
    return allInspections.map((insp) => insp.toJSON() as HiveInspectionServiceRetrievedDTO);
  }

  async delete(inspectionId: string, hiveId?: string): Promise<number> {
    const whereClause = hiveId ? { hive_inspection_id: inspectionId, hive_id: hiveId } : { hive_inspection_id: inspectionId };

    const deleteCount = await Hive_inspections.destroy({
      where: whereClause,
    });
    return deleteCount;
  }

  /**
   * Performs a JOIN query to check if a user owns a hive, and that hive owns the inspection.
   */
  async findHiveInspectionByMajorInspectionAndUser(inspectionId: string, majorInspectionId: string, userId: string): Promise<HiveInspectionServiceRetrievedDTO | null> {
    const inspection = await Hive_inspections.findOne({
      where: { hive_inspection_id: inspectionId, major_inspection_id: majorInspectionId },
      include: [
        {
          model: Hives,
          as: 'hive', // Must match your Sequelize association alias for HiveInspection.belongsTo(Hive)
          attributes: [],
          where: {
            hive_id: majorInspectionId, // Redundant but explicit
            user_id: userId, // Ensure the hive belongs to the user
          },
          required: true, // INNER JOIN  - Must find a matching hive

          include: [
            {
              model: Locations,
              as: 'location', // Assuming the association from Hive to Location is 'location'
              attributes: [], // Don't select any location columns
              where: {
                user_id: userId, // 3. The critical ownership check
              },
              required: true, // INNER JOIN: Must find a matching user-owned location
            },
          ],
        },
      ],
      // We are only interested in the inspection data if the join succeeds.
    });

    return inspection ? (inspection.toJSON() as HiveInspectionServiceRetrievedDTO) : null;
  }

  /**
   * Finds all hive inspections for a specific major-inspection.
   * @param majorInspectionId The ID of the major inspection.
   * @returns An array of hive-inspection DTOs.
   */
  public async findAllByMajorInspectionId(majorInspectionId: string): Promise<HiveInspectionServiceRetrievedDTO[]> {
    // Use Sequelize's findAll method to retrieve all records matching the foreign key.
    const allInspections = await Hive_inspections.findAll({
      where: {
        major_inspection_id: majorInspectionId,
      },
    });

    // Map the Sequelize model instances to your Service DTOs.
    return allInspections.map((insp) => insp.toJSON() as HiveInspectionServiceRetrievedDTO);
  }

  async findHiveInspectionByMajorInspectionLocationAndUser(
    hiveInspectionId: string,
    majorInspectionId: string,
    locationId: string,
    userId: string
  ): Promise<HiveInspectionServiceRetrievedDTO | null> {
    const inspection = await Hive_inspections.findOne({
      // 1. Filter by the main Hive Inspection ID
      where: {
        hive_inspection_id: hiveInspectionId,
      },
      // 2. Perform INNER JOIN to MajorInspection
      include: [
        {
          model: Major_inspections,
          as: 'hiveInspections_majorInspection',
          required: true, // Forces an INNER JOIN
          // Filter by the Major Inspection ID
          where: {
            major_inspection_id: majorInspectionId,
          },
          // 3. Perform INNER JOIN to Location
          include: [
            {
              model: Locations,
              as: 'majorInspection_location',
              required: true, // Forces an INNER JOIN
              // Filter by Location ID AND User ID
              where: {
                location_id: locationId,
                user_id: userId,
              },
              // Do not select columns from intermediate tables to keep the DTO clean
              attributes: [],
            },
          ],
          // Do not select columns from intermediate tables to keep the DTO clean
          attributes: [],
        },
      ],
      // The query should only return the columns from hive_inspections
      // If you need data from MajorInspection/Location, add it to 'attributes' on the nested includes
      // and handle the conversion to DTO accordingly.
    });

    // Convert the Sequelize instance to the DTO, or return null if not found
    return inspection ? (inspection.toJSON() as HiveInspectionServiceRetrievedDTO) : null;
  }
}
