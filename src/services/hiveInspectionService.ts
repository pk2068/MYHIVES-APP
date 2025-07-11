// src/services/hiveInspectionService.ts

import { HiveInspection } from '../database/models-obsolete/HiveInspection.js';
import { HiveInspection as HiveInspectionInterface } from '../types/models.js';
import { HiveInspectionCreationAttributes } from '../database/models-obsolete/HiveInspection.js'; // Import the creation attributes type

export class HiveInspectionService {
  public static async createHiveInspection(
    majorInspectionId: string,
    hiveInspectionData: HiveInspectionCreationAttributes
  ): Promise<HiveInspectionInterface> {
    const newHiveInspection = await HiveInspection.create({ ...hiveInspectionData, majorInspectionId });
    return newHiveInspection.toJSON();
  }

  public static async getHiveInspectionsByMajorInspectionId(
    majorInspectionId: string
  ): Promise<HiveInspectionInterface[]> {
    const hiveInspections = await HiveInspection.findAll({ where: { majorInspectionId }, order: [['createdAt', 'ASC']] });
    return hiveInspections.map(hi => hi.toJSON());
  }

  public static async getHiveInspectionById(
    id: string,
    majorInspectionId: string
  ): Promise<HiveInspectionInterface | null> {
    const hiveInspection = await HiveInspection.findOne({ where: { user_id: id, majorInspectionId } });
    return hiveInspection ? hiveInspection.toJSON() : null;
  }

  public static async updateHiveInspection(
    id: string,
    majorInspectionId: string,
    updateData: Partial<HiveInspectionInterface>
  ): Promise<HiveInspectionInterface | null> {
    const [numberOfAffectedRows, affectedRows] = await HiveInspection.update(updateData, {
      where: { user_id: id, majorInspectionId },
      returning: true,
    });

    if (numberOfAffectedRows === 0) {
      return null;
    }
    return affectedRows[0].toJSON();
  }

  public static async deleteHiveInspection(
    id: string,
    majorInspectionId: string
  ): Promise<boolean> {
    const deletedRows = await HiveInspection.destroy({
      where: { user_id: id, majorInspectionId },
    });
    return deletedRows > 0;
  }

  public static async getHiveInspectionsByHiveNumber(
    locationId: string, // Need locationId to ensure authorization chain
    hiveNumber: string
  ): Promise<HiveInspectionInterface[]> {
    // This requires a join or two queries to ensure the major inspection belongs to the correct location
    // For simplicity, we'll fetch all hive inspections and filter, or you might need a more complex Sequelize query with `include`
    const hiveInspections = await HiveInspection.findAll({
      include: [{
        association: 'majorInspection', // 'majorInspection' is the 'as' alias in your association
        where: { locationId: locationId },
        required: true // Ensures only major inspections linked to this location are considered
      }],
      where: { hiveNumber },
      order: [['createdAt', 'ASC']]
    });
    return hiveInspections.map(hi => hi.toJSON());
  }
}