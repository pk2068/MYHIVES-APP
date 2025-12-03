// tests/unit-tests/mocks/MockMajorInspectionRepository.ts

import { IMajorInspectionRepository } from '../../../src/repositories/interfaces/i-major-inspection-repository.js';
import {
  MajorInspectionServiceRetrievedDTO,
  MajorInspectionServiceCreateDTO,
  MajorInspectionServiceUpdateDTO,
} from '../../../src/services/dto/major-inspection-service.dto.js';
import { jest } from '@jest/globals';

const inspectionId = 'major-inspection-uuid-789';
const locationId = 'location-uuid-456';
const userId = 'user-uuid-123';

// Define the shape of a mock major inspection for testing purposes
const mockInspectionRetrieved: MajorInspectionServiceRetrievedDTO = {
  major_inspection_id: inspectionId,
  location_id: locationId,
  inspection_date: new Date('2024-10-20'),
  inspection_type: 'Spring',
  description: 'First spring inspection of the season.',
  created_at: new Date(),
  updated_at: new Date(),
};

const mockInspectionCreated: MajorInspectionServiceCreateDTO = {
  location_id: locationId,
  inspection_date: new Date('2024-10-20'),
  inspection_type: 'Autumn',
  description: 'Preparation for winter.',
};

const mockInspectionUpdated: MajorInspectionServiceUpdateDTO = {
  description: 'Updated description for Spring 2024.',
};

// Implement the interface with Jest mock functions
export class MockMajorInspectionRepository implements IMajorInspectionRepository {
  // CRUD Methods
  create: jest.MockedFunction<(inspection: MajorInspectionServiceCreateDTO) => Promise<MajorInspectionServiceRetrievedDTO>> = jest.fn();
  update: jest.MockedFunction<
    (majorInspectionId: string, locationId: string, inspection: MajorInspectionServiceUpdateDTO) => Promise<[number, MajorInspectionServiceRetrievedDTO[]]>
  > = jest.fn();

  findById: jest.MockedFunction<(majorInspectionId: string, locationId?: string) => Promise<MajorInspectionServiceRetrievedDTO | null>> = jest.fn();
  findAllByLocationId: jest.MockedFunction<(locationId: string) => Promise<MajorInspectionServiceRetrievedDTO[]>> = jest.fn();
  delete: jest.MockedFunction<(majorInspectionId: string, locationId?: string) => Promise<number>> = jest.fn();

  // Custom Ownership Check Method (For service to call before some operations, or for full ownership check)
  findInspectionByLocationAndUser: jest.MockedFunction<
    (majorInspectionId: string, locationId: string, userId: string) => Promise<MajorInspectionServiceRetrievedDTO | null>
  > = jest.fn();

  // Helper properties and methods for test setup
  public static mockInspectionRetrieved = mockInspectionRetrieved;
  public static mockInspectionCreated = mockInspectionCreated;
  public static mockInspectionUpdated = mockInspectionUpdated;
  public static mockMajorInspectionId: string = inspectionId;
  public static mockLocationId: string = locationId;
  public static mockUserId: string = userId;

  // Static method to create an instance and set default behaviors
  public static createMockInstance(): MockMajorInspectionRepository {
    const mockRepo = new MockMajorInspectionRepository();

    // Default mock implementations for successful scenarios
    mockRepo.create.mockResolvedValue(this.mockInspectionRetrieved);
    mockRepo.findById.mockResolvedValue(this.mockInspectionRetrieved);
    mockRepo.findAllByLocationId.mockResolvedValue([this.mockInspectionRetrieved]);
    mockRepo.update.mockResolvedValue([1, [this.mockInspectionRetrieved]]);
    mockRepo.delete.mockResolvedValue(1);

    // Default implementation for the ownership check (returns the inspection if owner)
    mockRepo.findInspectionByLocationAndUser.mockResolvedValue(this.mockInspectionRetrieved);

    return mockRepo;
  }
}
