import { Sequelize, Op } from 'sequelize';
import {
  IHiveInspectionRepository,
  IHiveInspectionCRUD,
  IHiveInspectionMajorInspectionQueries,
  IHiveInspectionHiveHistoryQueries,
  IHiveInspectionSecurityQueries,
} from '../interfaces/i-hive-inspection-repository.js';
import { Hive_inspections } from '../../database/models-ts/hive_inspections.js';
import { Major_inspections } from '../../database/models-ts/major-inspections.js';
import { Hives } from '../../database/models-ts/hives.js';
import { Locations } from '../../database/models-ts/locations.js';
import { HiveInspectionServiceCreateDTO, HiveInspectionServiceRetrievedDTO, HiveInspectionServiceUpdateDTO } from '../../services/dto/hive-inspection-service.dto.js';

/**
 * Concrete implementation of the IHiveInspectionRepository using Sequelize.
 * Implements all focused interfaces for complete hive inspection data access.
 */
export class HiveInspectionRepository implements IHiveInspectionRepository {
  private readonly db: Sequelize;

  constructor(db: Sequelize) {
    this.db = db;
  }

  // ======================================================================
  // IHiveInspectionCRUD Implementation
  // ======================================================================

  async create(inspection: HiveInspectionServiceCreateDTO): Promise<HiveInspectionServiceRetrievedDTO> {
    const newInspection = await Hive_inspections.create(inspection as any);
    return newInspection.toJSON() as HiveInspectionServiceRetrievedDTO;
  }

  async findById(inspectionId: string): Promise<HiveInspectionServiceRetrievedDTO | null> {
    const inspection = await Hive_inspections.findOne({
      where: { hive_inspection_id: inspectionId },
    });
    return inspection ? (inspection.toJSON() as HiveInspectionServiceRetrievedDTO) : null;
  }

  async update(inspectionId: string, inspection: HiveInspectionServiceUpdateDTO): Promise<[number, HiveInspectionServiceRetrievedDTO[]]> {
    return this.db.transaction(async (t) => {
      const [updatedCount, updatedInspections] = await Hive_inspections.update(inspection, {
        where: { hive_inspection_id: inspectionId },
        returning: true,
        transaction: t,
      });
      const dtos = updatedInspections.map((insp) => insp.toJSON() as HiveInspectionServiceRetrievedDTO);
      return [updatedCount, dtos];
    });
  }

  async delete(inspectionId: string): Promise<number> {
    const deleteCount = await Hive_inspections.destroy({
      where: { hive_inspection_id: inspectionId },
    });
    return deleteCount;
  }

  // ======================================================================
  // IHiveInspectionMajorInspectionQueries Implementation
  // ======================================================================

  async findByIdInMajorInspection(inspectionId: string, majorInspectionId: string): Promise<HiveInspectionServiceRetrievedDTO | null> {
    const inspection = await Hive_inspections.findOne({
      where: { hive_inspection_id: inspectionId, major_inspection_id: majorInspectionId },
    });
    return inspection ? (inspection.toJSON() as HiveInspectionServiceRetrievedDTO) : null;
  }

  async findAllByMajorInspectionId(majorInspectionId: string): Promise<HiveInspectionServiceRetrievedDTO[]> {
    const allInspections = await Hive_inspections.findAll({
      where: { major_inspection_id: majorInspectionId },
      order: [['inspection_date', 'DESC']],
    });
    return allInspections.map((insp) => insp.toJSON() as HiveInspectionServiceRetrievedDTO);
  }

  async updateInMajorInspection(
    inspectionId: string,
    majorInspectionId: string,
    inspection: HiveInspectionServiceUpdateDTO
  ): Promise<[number, HiveInspectionServiceRetrievedDTO[]]> {
    return this.db.transaction(async (t) => {
      const [updatedCount, updatedInspections] = await Hive_inspections.update(inspection, {
        where: { hive_inspection_id: inspectionId, major_inspection_id: majorInspectionId },
        returning: true,
        transaction: t,
      });
      const dtos = updatedInspections.map((insp) => insp.toJSON() as HiveInspectionServiceRetrievedDTO);
      return [updatedCount, dtos];
    });
  }

  async deleteInMajorInspection(inspectionId: string, majorInspectionId: string): Promise<number> {
    const deleteCount = await Hive_inspections.destroy({
      where: { hive_inspection_id: inspectionId, major_inspection_id: majorInspectionId },
    });
    return deleteCount;
  }

  // ======================================================================
  // IHiveInspectionHiveHistoryQueries Implementation
  // ======================================================================

  async findAllByHiveId(hiveId: string): Promise<HiveInspectionServiceRetrievedDTO[]> {
    const allInspections = await Hive_inspections.findAll({
      where: { hive_id: hiveId },
      include: [
        {
          model: Major_inspections,
          as: 'hiveInspections_majorInspection', // Match your Sequelize association
          required: true, // INNER JOIN - ensure we always have a major inspection
          attributes: ['major_inspection_id', 'inspection_date', 'general_notes'], // Include relevant fields
        },
      ],
      order: [[{ model: Major_inspections, as: 'hiveInspections_majorInspection' }, 'inspection_date', 'DESC']], // Sort by major inspection date
    });
    return allInspections.map((insp) => insp.toJSON() as HiveInspectionServiceRetrievedDTO);
  }

  async findAllByHiveIdAndDateRange(hiveId: string, startDate: Date, endDate: Date): Promise<HiveInspectionServiceRetrievedDTO[]> {
    const allInspections = await Hive_inspections.findAll({
      where: { hive_id: hiveId },
      include: [
        {
          model: Major_inspections,
          as: 'hiveInspections_majorInspection',
          required: true,
          attributes: ['major_inspection_id', 'inspection_date', 'general_notes'],
          where: {
            inspection_date: {
              [Op.between]: [startDate, endDate],
            },
          },
        },
      ],
      order: [[{ model: Major_inspections, as: 'hiveInspections_majorInspection' }, 'inspection_date', 'DESC']],
    });
    return allInspections.map((insp) => insp.toJSON() as HiveInspectionServiceRetrievedDTO);
  }

  async updateInHive(inspectionId: string, hiveId: string, inspection: HiveInspectionServiceUpdateDTO): Promise<[number, HiveInspectionServiceRetrievedDTO[]]> {
    return this.db.transaction(async (t) => {
      const [updatedCount, updatedInspections] = await Hive_inspections.update(inspection, {
        where: { hive_inspection_id: inspectionId, hive_id: hiveId },
        returning: true,
        transaction: t,
      });
      const dtos = updatedInspections.map((insp) => insp.toJSON() as HiveInspectionServiceRetrievedDTO);
      return [updatedCount, dtos];
    });
  }

  async deleteInHive(inspectionId: string, hiveId: string): Promise<number> {
    const deleteCount = await Hive_inspections.destroy({
      where: { hive_inspection_id: inspectionId, hive_id: hiveId },
    });
    return deleteCount;
  }

  // ======================================================================
  // IHiveInspectionSecurityQueries Implementation
  // ======================================================================

  async findHiveInspectionByMajorInspectionLocationAndUser(
    hiveInspectionId: string,
    majorInspectionId: string,
    locationId: string,
    userId: string
  ): Promise<HiveInspectionServiceRetrievedDTO | null> {
    const inspection = await Hive_inspections.findOne({
      where: {
        hive_inspection_id: hiveInspectionId,
      },
      include: [
        {
          model: Major_inspections,
          as: 'hiveInspections_majorInspection',
          required: true,
          where: {
            major_inspection_id: majorInspectionId,
          },
          include: [
            {
              model: Locations,
              as: 'majorInspection_location',
              required: true,
              where: {
                location_id: locationId,
                user_id: userId,
              },
              attributes: [],
            },
          ],
          attributes: [],
        },
      ],
    });

    return inspection ? (inspection.toJSON() as HiveInspectionServiceRetrievedDTO) : null;
  }

  async findHiveInspectionByHiveLocationAndUser(inspectionId: string, hiveId: string, locationId: string, userId: string): Promise<HiveInspectionServiceRetrievedDTO | null> {
    const inspection = await Hive_inspections.findOne({
      where: {
        hive_inspection_id: inspectionId,
        hive_id: hiveId,
      },
      include: [
        {
          model: Hives,
          as: 'hive',
          required: true,
          attributes: [],
          include: [
            {
              model: Locations,
              as: 'location',
              required: true,
              where: {
                location_id: locationId,
                user_id: userId,
              },
              attributes: [],
            },
          ],
        },
      ],
    });

    return inspection ? (inspection.toJSON() as HiveInspectionServiceRetrievedDTO) : null;
  }
}
