import { MajorInspectionService } from '../../../src/services/major-inspection-service.ts'; // Adjust path as needed
import { MockMajorInspectionRepository } from '../mocks/MockMajorInspectionRepository.ts';
import { IMajorInspectionRepository } from '../../../src/repositories/interfaces/i-major-inspection-repository.ts';
import {
  MajorInspectionServiceCreateDTO,
  MajorInspectionServiceRetrievedDTO,
  MajorInspectionServiceUpdateDTO,
} from '../../../src/services/dto/major-inspection-service.dto.ts';
import { beforeEach, describe, it, expect, jest } from '@jest/globals';

// --- MOCK DATA ---
const MOCK_USER_ID = MockMajorInspectionRepository.mockUserId;
const MOCK_LOCATION_ID = MockMajorInspectionRepository.mockLocationId;
const MOCK_INSPECTION_ID = MockMajorInspectionRepository.mockMajorInspectionId;
const MOCK_INSPECTION_RETRIEVED = MockMajorInspectionRepository.mockInspectionRetrieved;
const MOCK_INSPECTION_CREATED_DATA: MajorInspectionServiceCreateDTO = MockMajorInspectionRepository.mockInspectionCreated;
const MOCK_INSPECTION_UPDATE_DATA: MajorInspectionServiceUpdateDTO = {
  description: 'Updated Test Description',
  location_id: MOCK_LOCATION_ID,
};
const MOCK_INSPECTION_LIST: MajorInspectionServiceRetrievedDTO[] = [
  MOCK_INSPECTION_RETRIEVED,
  { ...MOCK_INSPECTION_RETRIEVED, major_inspection_id: 'inspection-uuid-999', description: 'Summer Check' },
];

describe('MajorInspectionService', () => {
  let majorInspectionService: MajorInspectionService;
  let mockRepository: MockMajorInspectionRepository;

  beforeEach(() => {
    // Recreate the mock and service instance before each test
    mockRepository = MockMajorInspectionRepository.createMockInstance();
    // The service must be initialized with the mocked repository (Dependency Injection)
    majorInspectionService = new MajorInspectionService(mockRepository as IMajorInspectionRepository);
    jest.clearAllMocks(); // Clear call counts on the mock functions
  });

  // ------------------------------------------------------------------
  // TEST BLOCK: READ Operations (Find)
  // ------------------------------------------------------------------
  describe('Read Operations', () => {
    // --- TEST: findById (Get Single Major Inspection) ---
    describe('findById (Get Major Inspection)', () => {
      it('should successfully retrieve a major inspection by ID', async () => {
        // Arrange (Default mock returns MOCK_INSPECTION_RETRIEVED)
        const findByIdSpy = mockRepository.findById;

        // Act
        const result = await majorInspectionService.getMajorInspectionById(MOCK_INSPECTION_ID, MOCK_LOCATION_ID);

        // Assert
        expect(findByIdSpy).toHaveBeenCalledWith(MOCK_INSPECTION_ID, MOCK_LOCATION_ID);
        expect(result).toEqual(MOCK_INSPECTION_RETRIEVED);
      });

      it('should return null if the major inspection is not found', async () => {
        // Arrange
        const findByIdSpy = mockRepository.findById.mockResolvedValue(null);

        // Act
        const result = await majorInspectionService.getMajorInspectionById('non-existent-id', MOCK_LOCATION_ID);

        // Assert
        expect(findByIdSpy).toHaveBeenCalled();
        expect(result).toBeNull();
      });
    });

    // --- TEST: findAllByLocationId (Get All Inspections for Location) ---
    describe('findAllByLocationId (Get Inspections by Location)', () => {
      it('should successfully retrieve a list of major inspections for a given location ID', async () => {
        // Arrange
        const findAllByLocationIdSpy = mockRepository.findAllByLocationId.mockResolvedValue(MOCK_INSPECTION_LIST);

        // Act
        const result = await majorInspectionService.getMajorInspectionsByLocationId(MOCK_LOCATION_ID);

        // Assert
        expect(findAllByLocationIdSpy).toHaveBeenCalledWith(MOCK_LOCATION_ID);
        expect(result).toEqual(MOCK_INSPECTION_LIST);
        expect(result.length).toBe(2);
      });

      it('should return an empty array if no major inspections are found for the location', async () => {
        // Arrange
        const findAllByLocationIdSpy = mockRepository.findAllByLocationId.mockResolvedValue([]);

        // Act
        const result = await majorInspectionService.getMajorInspectionsByLocationId('location-with-no-inspections');

        // Assert
        expect(findAllByLocationIdSpy).toHaveBeenCalled();
        expect(result).toEqual([]);
      });
    });
  });

  // ------------------------------------------------------------------
  // TEST BLOCK: WRITE Operations (Create, Update, Delete)
  // ------------------------------------------------------------------
  describe('Write Operations', () => {
    // --- TEST: createMajorInspection ---
    describe('createMajorInspection', () => {
      it('should successfully create and return a new major inspection', async () => {
        // Act
        const result = await majorInspectionService.createMajorInspection(MOCK_INSPECTION_CREATED_DATA);

        // Assert
        expect(mockRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            location_id: MOCK_LOCATION_ID,
            inspection_type: MOCK_INSPECTION_CREATED_DATA.inspection_type,
          })
        );
        expect(result).toEqual(MOCK_INSPECTION_RETRIEVED);
      });
    });

    // --- TEST: updateMajorInspection (Ownership Validation Check) ---
    describe('updateMajorInspection', () => {
      it('should return the updated inspection if it exists and ownership is confirmed', async () => {
        // Arrange
        // The mock default (from factory) is [1, [MOCK_INSPECTION_RETRIEVED]]
        const updateSpy = mockRepository.update;

        // Act
        const result = await majorInspectionService.updateMajorInspection(MOCK_INSPECTION_ID, MOCK_INSPECTION_UPDATE_DATA);

        // Assert
        // The Service calls the repository with all constraints (ID + Location ID).
        // We assume the service performs the triple-ID check before the update.
        expect(updateSpy).toHaveBeenCalledWith(MOCK_INSPECTION_ID, MOCK_LOCATION_ID, expect.objectContaining(MOCK_INSPECTION_UPDATE_DATA));
        expect(result).toEqual(MOCK_INSPECTION_RETRIEVED);
      });

      it('should return null if the update fails (not found/not owned)', async () => {
        // Arrange
        // Mock the update method to return 0 affected rows, indicating no update occurred
        const updateSpy = mockRepository.update.mockResolvedValue([0, []]);

        // Act
        const result = await majorInspectionService.updateMajorInspection('non-existent-id', MOCK_INSPECTION_UPDATE_DATA);

        // Assert
        expect(updateSpy).toHaveBeenCalled();
        expect(result).toBeNull();
      });
    });

    // --- TEST: deleteMajorInspection (Ownership Validation Check) ---
    describe('deleteMajorInspection', () => {
      it('should return true if the major inspection is successfully deleted with valid location/ownership', async () => {
        // Arrange
        // 1. Ownership check passes:
        mockRepository.findInspectionByLocationAndUser.mockResolvedValue(MOCK_INSPECTION_RETRIEVED);
        // 2. Delete succeeds:
        const deleteSpy = mockRepository.delete.mockResolvedValue(1);

        // Act
        const result = await majorInspectionService.deleteMajorInspection(MOCK_LOCATION_ID, MOCK_INSPECTION_ID);

        // Assert
        // Check that the service first validated ownership
        expect(mockRepository.findInspectionByLocationAndUser).toHaveBeenCalledWith(MOCK_INSPECTION_ID, MOCK_LOCATION_ID, MOCK_USER_ID);
        // Check that the delete method was called only after ownership validation
        expect(deleteSpy).toHaveBeenCalledWith(MOCK_INSPECTION_ID);
        expect(result).toBe(true);
      });

      it('should return false and NOT delete if the major inspection is not owned', async () => {
        // Arrange
        // 1. Ownership check fails:
        mockRepository.findInspectionByLocationAndUser.mockResolvedValue(null);
        // 2. Mock delete to ensure it is NOT called
        const deleteSpy = mockRepository.delete.mockResolvedValue(0);

        // Act
        const result = await majorInspectionService.deleteMajorInspection('wrong-location-id', 'non-owned-major-insp-id');

        // Assert
        expect(mockRepository.findInspectionByLocationAndUser).toHaveBeenCalled();
        // Crucially, the simple delete should not have been called
        expect(deleteSpy).not.toHaveBeenCalled();
        expect(result).toBe(false);
      });
    });
  });
});
