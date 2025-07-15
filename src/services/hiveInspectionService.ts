// src/services/hiveInspectionService.ts

import { hive_inspections } from '../database/models-ts/hive_inspections.js';
//import { major_inspections } from 'database/models-ts/major_inspections.js';
import { hive_inspectionsAttributes } from '../database/models-ts/hive_inspections.js'; // Importing the type for hive inspection attributes
//import { HiveInspection as HiveInspectionInterface } from '../types/models.js';
//import { HiveInspectionCreationAttributes } from '../database/models-obsolete/HiveInspection.js'; // Import the creation attributes type

export class HiveInspectionService {
  public static async createHiveInspection(majorInspectionId: string, hiveInspectionData: hive_inspectionsAttributes): Promise<hive_inspectionsAttributes> {
    const newHiveInspection = await hive_inspections.create({ ...hiveInspectionData, major_inspection_id: majorInspectionId });
    return newHiveInspection.toJSON();
  }

  public static async getHiveInspectionsByMajorInspectionId(majorInspectionId: string): Promise<hive_inspectionsAttributes[]> {
    const hiveInspections = await hive_inspections.findAll({ where: { major_inspection_id: majorInspectionId }, order: [['createdAt', 'ASC']] });
    return hiveInspections.map((hi) => hi.toJSON());
  }

  public static async getHiveInspectionById(id: string, majorInspectionId: string): Promise<hive_inspectionsAttributes | null> {
    const hiveInspection = await hive_inspections.findOne({ where: { hive_inspection_id: id, major_inspection_id: majorInspectionId } });
    return hiveInspection ? hiveInspection.toJSON() : null;
  }

  public static async updateHiveInspection(id: string, majorInspectionId: string, updateData: Partial<hive_inspectionsAttributes>): Promise<hive_inspectionsAttributes | null> {
    const [numberOfAffectedRows, affectedRows] = await hive_inspections.update(updateData, {
      where: { hive_inspection_id: id, major_inspection_id: majorInspectionId },
      returning: true,
    });

    if (numberOfAffectedRows === 0) {
      return null;
    }
    return affectedRows[0].toJSON();
  }

  public static async deleteHiveInspection(id: string, majorInspectionId: string): Promise<boolean> {
    const deletedRows = await hive_inspections.destroy({
      where: { hive_inspection_id: id, major_inspection_id: majorInspectionId },
    });
    return deletedRows > 0;
  }

  /**
   * Retrieves hive inspections for a specific hive, ensuring both the hive itself
   * and its associated major inspection belong to the given location.
   * This enforces a strong authorization chain and filters results precisely.
   *
   * @param locationId The ID of the location to filter by.
   * @param hiveNumber The ID of the hive to filter by (corresponds to hive_id).
   * @returns A promise that resolves to an array of hive inspection attributes.
   */
  public static async getHiveInspectionsByHiveNumber(
    locationId: string, // Need locationId to ensure authorization chain
    hiveNumber: string
  ): Promise<hive_inspectionsAttributes[]> {
    // This requires a join or two queries to ensure the major inspection belongs to the correct location
    // For simplicity, we'll fetch all hive inspections and filter, or you might need a more complex Sequelize query with `include`
    const hiveInspections = await hive_inspections.findAll({
      include: [
        {
          // 1. Include the 'majorInspection' association
          // This ensures the hive inspection is linked to a major inspection
          // that belongs to the specified location.
          association: 'majorInspection', // This alias must be defined in your hive_inspections model's BelongsTo decorator
          where: { location_id: locationId }, // Filter major_inspections by their location_id column
          required: true, // Perform an INNER JOIN, meaning the major inspection must exist and match the locationId
        },
        {
          // 2. Include the 'hive' association
          // This ensures the hive inspection is linked to a hive
          // that also belongs to the specified location.
          association: 'hive', // This alias must be defined in your hive_inspections model's BelongsTo decorator
          required: true, // Perform an INNER JOIN, meaning the hive must exist
          where: { location_id: locationId }, // Filter hives by their location_id column
        },
      ],
      where: {
        // 3. Filter the primary hive_inspections by the specific hive_id
        hive_id: hiveNumber,
      },
      order: [['created_at', 'ASC']],
    });
    return hiveInspections.map((hi) => hi.toJSON());
  }
}
