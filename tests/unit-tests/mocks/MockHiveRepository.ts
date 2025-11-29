import { IHiveRepository } from '../../../src/repositories/interfaces/i-hive-repository.js';
import { jest } from '@jest/globals';
import { HiveServiceRetrievedDTO, HiveServiceCreateDTO, HiveServiceUpdateDTO } from '../../../src/services/dto/hive-service.dto.js';

const hiveId = 'hive-uuid-123';
const locationId = 'location-uuid-456';

// Define the shape of a mock hive for testing purposes
// this one is my single source of truth
const mockHiveRetrieved: HiveServiceRetrievedDTO = {
  hive_id: hiveId,
  location_id: locationId,
  name: 'Test Hive',
  type: 'Langstroth',
  created_at: new Date(),
  updated_at: new Date(),
};

// that would be used as input for creating a new hive
const mockHiveCreated: HiveServiceCreateDTO = {
  location_id: locationId,
  name: 'Test Hive',
  type: 'Top-Bar',
};

// tghat would be used as output after creation
const mockHiveCreatedAfter: HiveServiceRetrievedDTO = {
  ...mockHiveCreated,
  hive_id: 'new-hive-uuid-789',
  created_at: new Date(),
  updated_at: new Date(),
};

// that would be used as input for updating an existing hive
const mockHiveUpdated: HiveServiceUpdateDTO = {
  name: 'Updated Test Hive',
};

const mockHiveUpdatedAfter: HiveServiceRetrievedDTO = {
  ...mockHiveRetrieved,
  ...mockHiveUpdated,
  updated_at: new Date(),
};

// Implement the interface with Jest mock functions
export class MockHiveRepository implements IHiveRepository {
  create: jest.MockedFunction<(hive: HiveServiceCreateDTO) => Promise<HiveServiceRetrievedDTO>> = jest.fn();
  update: jest.MockedFunction<(id: string, hive: HiveServiceUpdateDTO) => Promise<[number, HiveServiceRetrievedDTO[]]>> = jest.fn();
  findById: jest.MockedFunction<(hiveId: string, locationId?: string) => Promise<HiveServiceRetrievedDTO | null>> = jest.fn();
  findAllByLocationId: jest.MockedFunction<(locationId: string) => Promise<HiveServiceRetrievedDTO[]>> = jest.fn();
  delete: jest.MockedFunction<(id: string, locationId?: string) => Promise<number>> = jest.fn();
  deleteAll: jest.MockedFunction<(locationId: string) => Promise<number>> = jest.fn();

  // Helper properties and methods for test setup
  public static mockHiveRetrieved = mockHiveRetrieved;
  public static mockHiveCreated = mockHiveCreated;
  public static mockHiveCreatedAfter = mockHiveCreatedAfter;
  public static mockHiveUpdate = mockHiveUpdated;
  public static mockHiveUpdatedAfter = mockHiveUpdatedAfter;
  public static mockHiveId: string = hiveId;
  public static mockLocationId: string = locationId;

  // Use a factory method to create an instance and set default behaviors (optional, but clean)
  public static createMockInstance(): MockHiveRepository {
    // class members
    const mockRepo = new MockHiveRepository();

    // Default mock implementation: always resolve with the mock hive
    mockRepo.create.mockResolvedValue(this.mockHiveRetrieved);

    mockRepo.findById.mockResolvedValue(this.mockHiveRetrieved);

    mockRepo.findAllByLocationId.mockResolvedValue([this.mockHiveRetrieved]);
    mockRepo.update.mockResolvedValue([1, [this.mockHiveUpdatedAfter]]);
    mockRepo.delete.mockResolvedValue(1);
    mockRepo.deleteAll.mockResolvedValue(1);

    return mockRepo;
  }
}
