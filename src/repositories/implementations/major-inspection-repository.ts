import { Sequelize } from 'sequelize';
import { IMajorInspectionRepository } from '../interfaces/i-major-inspection-repository.js';
import { major_inspections } from '../../database/models-ts/major-inspections.js';
import { locations } from 'database/models-ts/locations.js';
import { MajorInspectionServiceCreateDTO, MajorInspectionServiceRetrievedDTO, MajorInspectionServiceUpdateDTO } from '../../services/dto/major-inspection-service.dto.js';

export class MajorInspectionRepository implements IMajorInspectionRepository {
  private readonly db: Sequelize; // Dependency for Sequelize instance (for transactions)

  constructor(db: Sequelize) {
    this.db = db;
  }

  async create(inspection: MajorInspectionServiceCreateDTO): Promise<MajorInspectionServiceRetrievedDTO> {
    const newInspection = await major_inspections.create(inspection);

    return newInspection.toJSON() as MajorInspectionServiceRetrievedDTO;
  }

  async update(inspectionId: string, locationId: string, inspection: MajorInspectionServiceUpdateDTO): Promise<[number, MajorInspectionServiceRetrievedDTO[]]> {
    // We use the managed transaction pattern for safety, guaranteeing rollback if necessary.
    return this.db.transaction(async (t) => {
      const [updatedCount, updatedInspections] = await major_inspections.update(inspection, {
        where: { major_inspection_id: inspectionId, location_id: locationId },
        returning: true,
        transaction: t, // Pass the transaction object
      });
      return [updatedCount, updatedInspections];
    });
  }

  async findById(inspectionId: string, location_id?: string): Promise<MajorInspectionServiceRetrievedDTO | null> {
    const inspection = await major_inspections.findOne({
      where: location_id ? { major_inspection_id: inspectionId, location_id: location_id } : { major_inspection_id: inspectionId },
    });
    return inspection ? (inspection.toJSON() as MajorInspectionServiceRetrievedDTO) : null;
  }

  async findAllByLocationId(locationId: string): Promise<MajorInspectionServiceRetrievedDTO[]> {
    const allInspections = await major_inspections.findAll({ where: { location_id: locationId } });
    return allInspections.map((insp) => insp.toJSON() as MajorInspectionServiceRetrievedDTO);
  }

  async delete(inspectionId: string, locationId?: string): Promise<number> {
    const deleteCount = await major_inspections.destroy({
      where: locationId ? { major_inspection_id: inspectionId, location_id: locationId } : { major_inspection_id: inspectionId },
    });
    return deleteCount;
  }

  async findInspectionByLocationAndUser(inspectionId: string, locationId: string, userId: string): Promise<MajorInspectionServiceRetrievedDTO | null> {
    const inspection = await major_inspections.findOne({
      where: { major_inspection_id: inspectionId },
      include: [
        {
          model: locations,
          as: 'majorInspection_location', // Use your correct association alias
          attributes: [],
          where: {
            location_id: locationId,
            user_id: userId, // 🔑 The critical ownership check
          },
          required: true, // Ensures it's an INNER JOIN (must exist)
        },
      ],
    });

    return inspection ? (inspection.toJSON() as MajorInspectionServiceRetrievedDTO) : null;
  }

  // end of class
}
