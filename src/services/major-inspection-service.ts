// src/services/majorInspectionService.ts
import { IMajorInspectionRepository } from 'repositories/interfaces/i-major-inspection-repository.js';
import { MajorInspectionServiceCreateDTO, MajorInspectionServiceRetrievedDTO, MajorInspectionServiceUpdateDTO } from './dto/major-inspection-service.dto.js';

export class MajorInspectionService {
  // Dependency Injection: Injecting the repository contract
  private _majorInspectionRepository: IMajorInspectionRepository;

  /**
   * Initializes the MajorInspectionService with a concrete repository implementation.
   * This implements Dependency Injection (DI).
   * @param majorInspectionRepository The repository instance (e.g., MajorInspectionRepository or MockMajorInspectionRepository).
   */
  constructor(majorInspectionRepository: IMajorInspectionRepository) {
    this._majorInspectionRepository = majorInspectionRepository;
  }

  public async createMajorInspection(inspectionData: MajorInspectionServiceCreateDTO): Promise<MajorInspectionServiceRetrievedDTO> {
    const newMajorInspection = await this._majorInspectionRepository.create(inspectionData);
    return newMajorInspection;
  }

  public async getMajorInspectionsByLocationId(locationId: string): Promise<MajorInspectionServiceRetrievedDTO[]> {
    const majorInspections = await this._majorInspectionRepository.findAllByLocationId(locationId);
    return majorInspections;
  }

  public async getMajorInspectionById(majorInspectionId: string, locationId: string): Promise<MajorInspectionServiceRetrievedDTO | null> {
    try {
      const majorInspection = await this._majorInspectionRepository.findById(majorInspectionId, locationId);
      return majorInspection;
    } catch (error) {
      console.error('TEST Error fetching major inspection by ID:', error);
      return null;
    }
  }

  public async updateMajorInspection(majorInspectionId: string, updateData: MajorInspectionServiceUpdateDTO): Promise<MajorInspectionServiceRetrievedDTO | null> {
    const [numberOfAffectedRows, affectedRows] = await this._majorInspectionRepository.update(majorInspectionId, updateData.location_id!, updateData);

    if (numberOfAffectedRows === 0) {
      return null;
    }
    return affectedRows[0];
  }

  public async deleteMajorInspection(locationId: string, majorInspectionId: string, userId: string): Promise<boolean> {
    const isOwner: boolean = await this.checkMajorInspectionOwnership(majorInspectionId, locationId, userId);

    if (!isOwner) {
      return false;
    }

    const deletedRows = await await this._majorInspectionRepository.delete(majorInspectionId, locationId);

    return deletedRows > 0;
  }

  public async foodbar(): Promise<void> {
    console.log('Foodbar method called');
  }

  /**
   * Checks if a Major Inspection exists at a specific Location owned by a specific User.
   * Delegates the triple-check to the Repository for efficiency.
   */
  public async checkMajorInspectionOwnership(majorInspectionId: string, locationId: string, userId: string): Promise<boolean> {
    // The repository will perform the JOIN/WHERE clause query.
    const inspection = await this._majorInspectionRepository.findInspectionByLocationAndUser(majorInspectionId, locationId, userId);

    return inspection !== null;
  }
}
