import { HiveService } from '../../../src/services/hive-service.ts';
import { MockHiveRepository } from '../mocks/MockHiveRepository.ts'; // Assuming this is the path
import { IHiveRepository } from '../../../src/repositories/interfaces/i-hive-repository.ts';
import { HiveServiceCreateDTO, HiveServiceRetrievedDTO, HiveServiceUpdateDTO } from '../../../src/services/dto/hive-service.dto.ts'; // Assuming you have DTOs for the service
import httpStatus from 'http-status';
import { beforeEach, describe, it, expect, jest } from '@jest/globals';

// --- MOCK DATA ---
const MOCK_USER_ID = MockHiveRepository.mockHiveId; //'user-7890';
const MOCK_LOCATION_ID = MockHiveRepository.mockLocationId; //'location-4567';
const MOCK_HIVE_ID = MockHiveRepository.mockHiveId; //'hive-1234';
const MOCK_HIVE_RETRIEVED = MockHiveRepository.mockHiveRetrieved;
const MOCK_HIVE_CREATED = MockHiveRepository.mockHiveCreated;
const MOCK_HIVE_CREATED_AFTER = MockHiveRepository.mockHiveCreatedAfter;
const MOCK_HIVE_UPDATE = MockHiveRepository.mockHiveUpdate;
const MOCK_HIVE_UPDATED_AFTER = MockHiveRepository.mockHiveUpdatedAfter;

// // The actual structure of the retrieved HiveDTO will match the database model properties
const MOCK_HIVE: HiveServiceRetrievedDTO = {
  hive_id: MOCK_HIVE_ID,
  location_id: MOCK_LOCATION_ID,
  hive_number: 'Hive 1A',
  description: 'First Langstroth hive at test location',
  supers_count: 2,
  brood_frames_count: 10,
  created_at: new Date('2025-10-27T10:00:00.000Z'),
  updated_at: new Date('2025-10-27T10:00:00.000Z'),
};

const MOCK_HIVE2: HiveServiceRetrievedDTO = {
  hive_id: `${MOCK_HIVE_ID}-2`,
  location_id: MOCK_LOCATION_ID,
  hive_number: `Hive 2A`,
  description: 'First Langstroth hive at test location',
  supers_count: 5,
  brood_frames_count: 8,
  created_at: new Date('2025-10-27T10:00:00.000Z'),
  updated_at: new Date('2025-10-27T10:00:00.000Z'),
};

// const MOCK_HIVE_CREATE_DATA: HiveServiceCreateDTO = {
//   location_id: MOCK_LOCATION_ID,
//   hive_number: 'Hive 1A',
//   description: 'First Langstroth hive at location 4567',
//   supers_count: 2,
//   brood_frames_count: 10,
// };

// const MOCK_HIVE_UPDATE_DATA: HiveServiceUpdateDTO = {
//   description: 'Updated description for Hive 1A',
//   supers_count: 3,
// };

describe('HiveService', () => {
  let hiveService: HiveService;
  // Use IHiveRepository interface for type hinting the mock instance
  let mockHiveRepository: IHiveRepository;

  // Use beforeEach to ensure a fresh service and mock instance for every test
  beforeEach(() => {
    // 1. Create a new instance of the Mock repository
    mockHiveRepository = MockHiveRepository.createMockInstance();

    // 2. Inject the mock into the service
    hiveService = new HiveService(mockHiveRepository);

    // 3. Clear all mock calls before each test (best practice with spies)
    jest.clearAllMocks();
  });

  // ------------------------------------------------------------------
  // TEST: getAllHivesByLocationId
  // ------------------------------------------------------------------
  describe('getAllHivesByLocationId', () => {
    it('should return an array of hives for a valid user and location', async () => {
      // Arrange
      const expectedHives = [MOCK_HIVE, MOCK_HIVE2];
      // Spy on the repository method and mock its implementation
      const findAllByLocationIdSpy = jest.spyOn(mockHiveRepository, 'findAllByLocationId').mockResolvedValue(expectedHives);

      // Act
      const result = await hiveService.getHivesByLocationId(MOCK_LOCATION_ID);

      // Assert
      expect(findAllByLocationIdSpy).toHaveBeenCalledWith(MOCK_LOCATION_ID);
      expect(result).toEqual(expectedHives);
      expect(result.length).toBe(2);
    });

    it('should return an empty array if no hives are found', async () => {
      // Arrange
      const findAllByLocationIdSpy = jest.spyOn(mockHiveRepository, 'findAllByLocationId').mockResolvedValue([]);

      // Act
      const result = await hiveService.getHivesByLocationId(MOCK_LOCATION_ID);

      // Assert
      expect(findAllByLocationIdSpy).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should return an empty array if location is not existend', async () => {
      // Arrange
      const findAllByLocationIdSpy = jest.spyOn(mockHiveRepository, 'findAllByLocationId').mockResolvedValue([]);

      // Act
      const result = await hiveService.getHivesByLocationId('non-existent-location-id');

      // Assert
      expect(findAllByLocationIdSpy).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  // ------------------------------------------------------------------
  // TEST: getHiveById
  // ------------------------------------------------------------------
  describe('getHiveById', () => {
    it('should return the hive when found', async () => {
      // Arrange
      const findByIdSpy = jest.spyOn(mockHiveRepository, 'findById').mockResolvedValue(MOCK_HIVE_RETRIEVED);

      // Act
      const result = await hiveService.getHiveById(MOCK_HIVE_RETRIEVED.location_id, MOCK_HIVE_RETRIEVED.hive_id);

      // Assert
      expect(findByIdSpy).toHaveBeenCalledWith(MOCK_HIVE_RETRIEVED.hive_id, MOCK_HIVE_RETRIEVED.location_id);
      expect(result).toEqual(MOCK_HIVE_RETRIEVED);
    });

    it('should return null if the hive is not found ', async () => {
      // Arrange
      const findByIdSpy = jest.spyOn(mockHiveRepository, 'findById').mockResolvedValue(null);

      // Act
      const result = await hiveService.getHiveById(MOCK_LOCATION_ID, 'non-existent-hive-id');

      // Assert
      expect(findByIdSpy).toHaveBeenCalledWith('non-existent-hive-id', MOCK_LOCATION_ID);
      expect(result).toBeNull();
    });
  });

  // ------------------------------------------------------------------
  // TEST: createHive
  // ------------------------------------------------------------------
  describe('createHive', () => {
    it('should successfully create and return a new hive', async () => {
      // Arrange

      const createSpy = jest.spyOn(mockHiveRepository, 'create').mockResolvedValue(MOCK_HIVE_CREATED_AFTER);

      // Act
      const result = await hiveService.createHive(MOCK_HIVE_CREATED);

      // Assert
      expect(createSpy).toHaveBeenCalledWith(MOCK_HIVE_CREATED);
      expect(result).toEqual(MOCK_HIVE_CREATED_AFTER);
    });

    // You might add a test here for unique constraint violation,
    // which would involve the service catching an error from the repository
    // and re-throwing a custom ServiceError or null/false as per your error handling design.
  });

  // ------------------------------------------------------------------
  // TEST: updateHive
  // ------------------------------------------------------------------
  describe('updateHive', () => {
    it('should successfully update and return the updated hive', async () => {
      // Arrange
      // const updatedHive = { ...MOCK_HIVE, ...MOCK_HIVE_UPDATE_DATA, updated_at: new Date() };
      // 1. Mock the findById call to ensure the hive exists and is owned
      const findByIdSpy = jest.spyOn(mockHiveRepository, 'findById').mockResolvedValue(MOCK_HIVE_UPDATED_AFTER);
      // 2. Mock the update call (which usually returns [count, [updatedObject]])
      const updateSpy = jest.spyOn(mockHiveRepository, 'update').mockResolvedValue([1, [MOCK_HIVE_UPDATED_AFTER]]);

      // Act
      const result = await hiveService.updateHive(MOCK_HIVE_UPDATED_AFTER.hive_id, MOCK_HIVE_UPDATE);

      // Assert
      expect(findByIdSpy).toHaveBeenCalledWith(MOCK_HIVE_UPDATED_AFTER.hive_id);
      expect(updateSpy).toHaveBeenCalledWith(MOCK_HIVE_UPDATED_AFTER.hive_id, MOCK_HIVE_UPDATE);
      expect(result).toEqual(MOCK_HIVE_UPDATED_AFTER);
    });

    it('should return null if the hive to update is not found', async () => {
      // Arrange
      const findByIdSpy = jest.spyOn(mockHiveRepository, 'findById').mockResolvedValue(null);
      const updateSpy = jest.spyOn(mockHiveRepository, 'update'); // Should not be called

      // Act
      const result = await hiveService.updateHive('non-existent-id', MOCK_HIVE_UPDATE);

      // Assert
      expect(findByIdSpy).toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  // ------------------------------------------------------------------
  // TEST: deleteHive
  // ------------------------------------------------------------------
  describe('deleteHive', () => {
    it('should return true if the hive is successfully deleted', async () => {
      // Arrange
      // Mock the delete method to return a count of deleted rows (1 for success)
      const deleteSpy = jest.spyOn(mockHiveRepository, 'delete').mockResolvedValue(1);

      // Act
      const result = await hiveService.deleteHive(MOCK_LOCATION_ID, MOCK_HIVE_ID);

      // Assert
      expect(deleteSpy).toHaveBeenCalledWith(MOCK_HIVE_ID, MOCK_LOCATION_ID);
      expect(result).toBe(true);
    });

    it('should return false if the hive was not found or not owned', async () => {
      // Arrange
      // Mock the delete method to return 0 deleted rows
      const deleteSpy = jest.spyOn(mockHiveRepository, 'delete').mockResolvedValue(0);

      // Act
      const result = await hiveService.deleteHive('non-existent-location-id', 'non-existent-hive-id');

      // Assert
      expect(deleteSpy).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
