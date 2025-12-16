import { Sequelize } from 'sequelize';
import { IMajorInspectionRepository } from '../interfaces/i-major-inspection-repository.js';
import { Major_inspections } from '../../database/models-ts/major-inspections.js';
import { Locations } from 'database/models-ts/locations.js';
import { MajorInspectionServiceCreateDTO, MajorInspectionServiceRetrievedDTO, MajorInspectionServiceUpdateDTO } from '../../services/dto/major-inspection-service.dto.js';

export class MajorInspectionRepository implements IMajorInspectionRepository {
  private readonly db: Sequelize; // Dependency for Sequelize instance (for transactions)

  constructor(db: Sequelize) {
    this.db = db;
  }

  async create(inspection: MajorInspectionServiceCreateDTO): Promise<MajorInspectionServiceRetrievedDTO> {
    const newInspection = await Major_inspections.create(inspection);

    return newInspection.toJSON() as MajorInspectionServiceRetrievedDTO;
  }

  async update(inspectionId: string, locationId: string, inspection: MajorInspectionServiceUpdateDTO): Promise<[number, MajorInspectionServiceRetrievedDTO[]]> {
    // We use the managed transaction pattern for safety, guaranteeing rollback if necessary.
    return this.db.transaction(async (t) => {
      const [updatedCount, updatedInspections] = await Major_inspections.update(inspection, {
        where: { major_inspection_id: inspectionId, location_id: locationId },
        returning: true,
        transaction: t, // Pass the transaction object
      });
      return [updatedCount, updatedInspections];
    });
  }

  async findById(inspectionId: string, location_id?: string): Promise<MajorInspectionServiceRetrievedDTO | null> {
    const inspection = await Major_inspections.findOne({
      where: location_id ? { major_inspection_id: inspectionId, location_id: location_id } : { major_inspection_id: inspectionId },
    });
    return inspection ? (inspection.toJSON() as MajorInspectionServiceRetrievedDTO) : null;
  }

  async findAllByLocationId(locationId: string): Promise<MajorInspectionServiceRetrievedDTO[]> {
    const allInspections = await Major_inspections.findAll({ where: { location_id: locationId } });
    return allInspections.map((insp) => insp.toJSON() as MajorInspectionServiceRetrievedDTO);
  }

  public async delete(inspectionId: string, locationId?: string): Promise<number> {
    const deleteCount = await Major_inspections.destroy({
      where: locationId ? { major_inspection_id: inspectionId, location_id: locationId } : { major_inspection_id: inspectionId },
    });
    return deleteCount;
  }

  public async findInspectionByLocationAndUser(inspectionId: string, locationId: string, userId: string): Promise<MajorInspectionServiceRetrievedDTO | null> {
    const inspection = await Major_inspections.findOne({
      where: { major_inspection_id: inspectionId },
      include: [
        {
          model: Locations,
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
