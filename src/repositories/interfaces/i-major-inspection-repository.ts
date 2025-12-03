import { MajorInspectionServiceCreateDTO, MajorInspectionServiceRetrievedDTO, MajorInspectionServiceUpdateDTO } from 'services/dto/major-inspection-service.dto.js';

export interface IMajorInspectionRepository {
  /**
   * Creates a new major inspection record.
   * @param inspection The data for the new major inspection.
   * @returns The created major inspection DTO.
   */
  create(inspection: MajorInspectionServiceCreateDTO): Promise<MajorInspectionServiceRetrievedDTO>;

  update(inspectionId: string, locationId: string, inspection: MajorInspectionServiceUpdateDTO): Promise<[number, MajorInspectionServiceRetrievedDTO[]]>;

  findById(inspectionId: string, locationId: string): Promise<MajorInspectionServiceRetrievedDTO | null>;

  findAllByLocationId(locationId: string): Promise<MajorInspectionServiceRetrievedDTO[]>;

  delete(inspectionId: string, locationId?: string): Promise<number>;

  findInspectionByLocationAndUser(inspectionId: string, locationId: string, userId: string): Promise<MajorInspectionServiceRetrievedDTO | null>;
}
