// Use the actual service class and MajorInspectionService dependency
import { HiveInspectionService } from '../../../src/services/hive-inspection-service.ts'; // Adjust path as needed
import { MajorInspectionService } from '../../../src/services/major-inspection-service.ts'; // Adjust path as needed

// Import necessary types and mock implementation
// import { IHiveInspectionRepository } from '../../../src/repositories/interfaces/i-hive-inspection-repository.ts';
// import { HiveInspectionServiceCreateDTO, HiveInspectionServiceRetrievedDTO, HiveInspectionServiceUpdateDTO } from '../../../src/services/dto/hive-inspection-service.dto.ts';
import { MockHiveInspectionRepository } from '../mocks/MockHiveInspectionRepository.ts'; // Adjust path as needed

import { beforeEach, describe, it, expect, jest } from '@jest/globals';

// --- MOCK DEPENDENCIES SETUP ---
// Create a Jest mock for MajorInspectionService
// We only mock the methods that HiveInspectionService depends on.
const mockMajorInspectionService: jest.Mocked<MajorInspectionService> = {
  checkMajorInspectionOwnership: jest.fn(),
} as unknown as jest.Mocked<MajorInspectionService>;

// --- CONSTANTS AND TEST DATA ---
// --- CONSTANTS AND TEST DATA (Retrieved from the mock repository for consistency) ---
const mockRetrieved = MockHiveInspectionRepository.mockHiveInspectionRetrieved;
const mockCreateData = MockHiveInspectionRepository.mockHiveInspectionCreationData;
const mockUpdateData = MockHiveInspectionRepository.mockHiveInspectionUpdateData;
const mockMajorInspectionId = MockHiveInspectionRepository.mockHiveMajorInspectionId;
const mockHiveId = MockHiveInspectionRepository.mockHiveId;
const mockUserId = MockHiveInspectionRepository.mockUserId;
const mockInspectionId = mockRetrieved.hive_inspection_id;
const mockLocationId = MockHiveInspectionRepository.mockLocationId;

// --- TEST SUITE ---
describe('HiveInspectionService Unit Tests', () => {
  let mockRepository: MockHiveInspectionRepository;
  let service: HiveInspectionService;

  beforeEach(() => {
    // 1. Create a fresh instance of the mock repository with default successful behavior
    mockRepository = MockHiveInspectionRepository.createMockInstance();

    // 2. Clear all mock function calls before each test
    jest.clearAllMocks();

    // 3. Set default mock responses for non-repository dependencies
    // Assuming ownership checks pass by default for happy path tests
    mockMajorInspectionService.checkMajorInspectionOwnership.mockResolvedValue(true);

    // 4. Instantiate the service with mock dependencies
    service = new HiveInspectionService(mockRepository, mockMajorInspectionService);
  });

  // ------------------------------------------------------------------
  // createHiveInspection
  // ------------------------------------------------------------------
  describe('createHiveInspection', () => {
    it('should successfully call the repository create method and return the created DTO', async () => {
      const result = await service.createHiveInspection(mockCreateData);

      // 1. Verify repository was called correctly
      expect(mockRepository.create).toHaveBeenCalledWith(mockCreateData);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);

      // 2. Verify the returned object matches the mock success response
      expect(result).toEqual(mockRetrieved);
    });
  });

  // ------------------------------------------------------------------
  // getHiveInspectionById
  // ------------------------------------------------------------------
  describe('getHiveInspectionById', () => {
    it('should successfully retrieve an inspection by its ID and Hive ID', async () => {
      const result = await service.getHiveInspectionById(mockInspectionId, mockHiveId);

      // 1. Verify repository was called correctly
      expect(mockRepository.findById).toHaveBeenCalledWith(mockInspectionId);
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);

      // 2. Verify the returned object
      expect(result).toEqual(mockRetrieved);
    });

    it('should return null if the repository returns null', async () => {
      // Override default mock behavior for this test
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.getHiveInspectionById('non-existent-id', mockHiveId);

      expect(result).toBeNull();
    });
  });

  // ------------------------------------------------------------------
  // getAllHiveInspectionsByMajorInspectionId
  // ------------------------------------------------------------------
  describe('getAllHiveInspectionsByMajorInspectionId', () => {
    it('should successfully retrieve all inspections for a major inspection if user owns it', async () => {
      const expectedArray = [mockRetrieved];

      const result = await service.getHiveInspectionsByMajorInspectionId(mockMajorInspectionId, 'mock-location-1', mockUserId);

      // 1. Verify ownership check was performed
      expect(mockMajorInspectionService.checkMajorInspectionOwnership).toHaveBeenCalledWith(mockMajorInspectionId, 'mock-location-1', mockUserId);

      // 2. Verify repository was called
      expect(mockRepository.findAllByMajorInspectionId).toHaveBeenCalledWith(mockMajorInspectionId);

      // 3. Verify the returned array
      expect(result).toEqual(expectedArray);
    });

    it('should return an empty array if the major inspection ownership check fails', async () => {
      // Override ownership check failure
      mockMajorInspectionService.checkMajorInspectionOwnership.mockResolvedValue(false);

      const result = await service.getHiveInspectionsByMajorInspectionId('not-owned-id', 'mock-location-1', mockUserId);

      // Should return an empty array (or throw, depending on service design, but empty array is safer for lists)
      expect(result).toEqual(null);

      // Repository should NOT have been called if ownership failed first
      expect(mockRepository.findAllByMajorInspectionId).not.toHaveBeenCalled();
    });
  });

  // ------------------------------------------------------------------
  // updateHiveInspection
  // ------------------------------------------------------------------
  describe('updateHiveInspection', () => {
    it('should successfully call the repository update method and return the updated DTO', async () => {
      const expectedUpdatedData = {
        ...mockRetrieved,
        ...mockUpdateData, // Merge the mock update data
      };
      // Override the default mock return value to reflect the actual update logic
      mockRepository.update.mockResolvedValue([1, [expectedUpdatedData]]);

      const result = await service.updateHiveInspection(mockInspectionId, mockHiveId, mockUpdateData);

      // 1. Verify repository was called correctly
      expect(mockRepository.update).toHaveBeenCalledWith(mockInspectionId, mockUpdateData);

      // 2. Verify the returned object
      expect(result).toEqual(expectedUpdatedData);
      expect(result.raising_new_queen).toBe(true);
      expect(result.queen_cell_age_days).toBe(33);
    });

    it('should return null if the update operation affects zero rows', async () => {
      // Mock the repository to indicate no rows were updated
      mockRepository.update.mockResolvedValue([0, []]);

      const result = await service.updateHiveInspection('non-existent-id', mockHiveId, mockUpdateData);

      expect(result).toBeNull();
    });
  });

  // ------------------------------------------------------------------
  // deleteHiveInspection
  // ------------------------------------------------------------------
  describe('deleteHiveInspection', () => {
    it('should successfully delete an inspection if owned by the user and return true', async () => {
      // Ensure the service can first find the inspection to check ownership/existence
      mockRepository.findHiveInspectionByMajorInspectionLocationAndUser.mockResolvedValue(mockRetrieved);
      // Ensure the delete call succeeds
      mockRepository.delete.mockResolvedValue(1);

      const result = await service.deleteHiveInspection(mockInspectionId, mockMajorInspectionId, mockLocationId, mockUserId);

      // 1. Verify ownership check was called
      expect(mockRepository.findHiveInspectionByMajorInspectionLocationAndUser).toHaveBeenCalledWith(mockInspectionId, mockMajorInspectionId, mockLocationId, mockUserId);

      // 2. Verify repository delete was called
      expect(mockRepository.delete).toHaveBeenCalledWith(mockInspectionId);

      // 3. Verify the final result
      expect(result).toBe(true);
    });

    it('should return false if the inspection is not found or not owned', async () => {
      // Setup mock to fail the ownership/existence check
      mockRepository.findHiveInspectionByMajorInspectionLocationAndUser.mockResolvedValue(null);

      const result = await service.deleteHiveInspection('not-owned-id', mockHiveId, mockUserId);

      expect(result).toBe(false);

      // Verify delete was NOT called
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should return false if the delete operation affects zero rows', async () => {
      // Ensure the service can find the inspection initially
      mockRepository.findHiveInspectionByMajorInspectionLocationAndUser.mockResolvedValue(mockRetrieved);
      // Mock the repository to indicate no rows were deleted
      mockRepository.delete.mockResolvedValue(0);

      const result = await service.deleteHiveInspection(mockInspectionId, mockHiveId, mockUserId);

      expect(result).toBe(false);
      expect(mockRepository.delete).toHaveBeenCalledTimes(1);
    });
  });
});
