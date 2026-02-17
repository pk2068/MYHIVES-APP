import { HiveInspectionServiceCreateDTO, HiveInspectionServiceRetrievedDTO, HiveInspectionServiceUpdateDTO } from '../../../src/services/dto/hive-inspection-service.dto.js';
import {
  IHiveInspectionRepository,
  IHiveInspectionCRUD,
  IHiveInspectionMajorInspectionQueries,
  IHiveInspectionHiveHistoryQueries,
  IHiveInspectionSecurityQueries,
} from '../../../src/repositories/interfaces/i-hive-inspection-repository.js';
import { jest } from '@jest/globals';

// Mock data constants
const userId = 'user-uuid-123';
const hiveId = 'hive-uuid-456';
const hiveInspectionId = 'hive-inspection-uuid-789';
const majorInspectionId = 'major-inspection-uuid-101112';
const locationId = 'location-uuid-555';

const mockHiveInspectionRetrieved: HiveInspectionServiceRetrievedDTO = {
  hive_inspection_id: hiveInspectionId,
  hive_id: hiveId,
  major_inspection_id: majorInspectionId,
  inspection_time: new Date('2023-01-01T10:30:00Z'),
  colony_health_status_id: 1,
  num_chambers: 1,
  brood_frames_count: 6,
  brood_percentage: 30,
  queen_status_id: 1,
  approx_honey_weight_kg: 45,
  drone_comb_frames_count: 2,
  drone_comb_percentage: 5,
  sugar_feed_added: false,
  sugar_feed_quantity_kg: 0,
  brood_chambers_count: 1,
  supers_count: 0,
  queen_excluder_present: false,
  num_varroa_mites_found: 0,
  varroa_treatment_id: 1,
  varroa_treatment_dosage: '1 ml OC',
  raising_new_queen: false,
  queen_cell_age_days: 0,
  queen_cell_status_id: 0,
  other_notes: 'Initial inspection notes',
  created_at: new Date('2023-01-01T00:00:00Z'),
  updated_at: new Date('2023-01-01T00:00:00Z'),
  hiveInspections_majorInspection: {
    major_inspection_id: majorInspectionId,
    inspection_date: new Date('2023-01-01'),
    general_notes: 'Good overall health',
  },
};

const mockHiveInspectionCreationData: HiveInspectionServiceCreateDTO = {
  hive_id: 'mock-hive-1',
  major_inspection_id: 'mock-major-1',
  inspection_date: new Date('2023-01-01'),
  colony_health_status_id: 1,
  num_chambers: 1,
  brood_frames_count: 6,
  brood_percentage: 30,
  queen_status_id: 1,
  approx_honey_weight_kg: 45,
  drone_comb_frames_count: 2,
  drone_comb_percentage: 5,
  sugar_feed_added: false,
  sugar_feed_quantity_kg: 0,
  brood_chambers_count: 1,
  supers_count: 0,
  queen_excluder_present: false,
  num_varroa_mites_found: 0,
  varroa_treatment_id: 1,
  varroa_treatment_dosage: '1 ml OC',
  raising_new_queen: false,
  queen_cell_age_days: 0,
  queen_cell_status_id: 0,
  other_notes: 'Initial inspection notes',
};

const mockHiveInspectionUpdateData: HiveInspectionServiceUpdateDTO = {
  raising_new_queen: true,
  queen_cell_age_days: 33,
  queen_cell_status_id: 1,
  other_notes: 'Updated inspection notes',
};

/**
 * Mock implementation of IHiveInspectionRepository for testing.
 * Implements all focused interfaces for testing hive inspection data access.
 */
export class MockHiveInspectionRepository implements IHiveInspectionRepository {
  // ======================================================================
  // IHiveInspectionCRUD Methods
  // ======================================================================
  create: jest.MockedFunction<(inspection: HiveInspectionServiceCreateDTO) => Promise<HiveInspectionServiceRetrievedDTO>> = jest.fn();

  findById: jest.MockedFunction<(inspectionId: string) => Promise<HiveInspectionServiceRetrievedDTO | null>> = jest.fn();

  update: jest.MockedFunction<(inspectionId: string, inspection: HiveInspectionServiceUpdateDTO) => Promise<[number, HiveInspectionServiceRetrievedDTO[]]>> = jest.fn();

  delete: jest.MockedFunction<(inspectionId: string) => Promise<number>> = jest.fn();

  // ======================================================================
  // IHiveInspectionMajorInspectionQueries Methods
  // ======================================================================
  findByIdInMajorInspection: jest.MockedFunction<(inspectionId: string, majorInspectionId: string) => Promise<HiveInspectionServiceRetrievedDTO | null>> = jest.fn();

  findAllByMajorInspectionId: jest.MockedFunction<(majorInspectionId: string) => Promise<HiveInspectionServiceRetrievedDTO[]>> = jest.fn();

  updateInMajorInspection: jest.MockedFunction<
    (inspectionId: string, majorInspectionId: string, inspection: HiveInspectionServiceUpdateDTO) => Promise<[number, HiveInspectionServiceRetrievedDTO[]]>
  > = jest.fn();

  deleteInMajorInspection: jest.MockedFunction<(inspectionId: string, majorInspectionId: string) => Promise<number>> = jest.fn();

  // ======================================================================
  // IHiveInspectionHiveHistoryQueries Methods
  // ======================================================================
  findAllByHiveId: jest.MockedFunction<(hiveId: string) => Promise<HiveInspectionServiceRetrievedDTO[]>> = jest.fn();

  findAllByHiveIdAndDateRange: jest.MockedFunction<(hiveId: string, startDate: Date, endDate: Date) => Promise<HiveInspectionServiceRetrievedDTO[]>> = jest.fn();

  updateInHive: jest.MockedFunction<(inspectionId: string, hiveId: string, inspection: HiveInspectionServiceUpdateDTO) => Promise<[number, HiveInspectionServiceRetrievedDTO[]]>> =
    jest.fn();

  deleteInHive: jest.MockedFunction<(inspectionId: string, hiveId: string) => Promise<number>> = jest.fn();

  // ======================================================================
  // IHiveInspectionSecurityQueries Methods
  // ======================================================================
  findHiveInspectionByMajorInspectionLocationAndUser: jest.MockedFunction<
    (hiveInspectionId: string, majorInspectionId: string, locationId: string, userId: string) => Promise<HiveInspectionServiceRetrievedDTO | null>
  > = jest.fn();

  findHiveInspectionByHiveLocationAndUser: jest.MockedFunction<
    (inspectionId: string, hiveId: string, locationId: string, userId: string) => Promise<HiveInspectionServiceRetrievedDTO | null>
  > = jest.fn();

  // ======================================================================
  // Helper properties and static methods
  // ======================================================================
  public static mockHiveInspectionRetrieved = mockHiveInspectionRetrieved;
  public static mockHiveInspectionCreationData = mockHiveInspectionCreationData;
  public static mockHiveInspectionUpdateData = mockHiveInspectionUpdateData;
  public static mockHiveMajorInspectionId: string = mockHiveInspectionRetrieved.major_inspection_id;
  public static mockHiveId: string = mockHiveInspectionRetrieved.hive_id;
  public static mockUserId: string = userId;
  public static mockLocationId: string = locationId;

  /**
   * Creates a mock instance with default successful behavior for all methods.
   * Use this in beforeEach hooks and customize specific methods as needed for individual tests.
   */
  public static createMockInstance(): MockHiveInspectionRepository {
    const mockRepo = new MockHiveInspectionRepository();

    // ======================================================================
    // Default IHiveInspectionCRUD implementations
    // ======================================================================
    mockRepo.create.mockResolvedValue(this.mockHiveInspectionRetrieved);
    mockRepo.findById.mockResolvedValue(this.mockHiveInspectionRetrieved);
    mockRepo.update.mockResolvedValue([1, [this.mockHiveInspectionRetrieved]]);
    mockRepo.delete.mockResolvedValue(1);

    // ======================================================================
    // Default IHiveInspectionMajorInspectionQueries implementations
    // ======================================================================
    mockRepo.findByIdInMajorInspection.mockResolvedValue(this.mockHiveInspectionRetrieved);
    mockRepo.findAllByMajorInspectionId.mockResolvedValue([this.mockHiveInspectionRetrieved]);
    mockRepo.updateInMajorInspection.mockResolvedValue([1, [this.mockHiveInspectionRetrieved]]);
    mockRepo.deleteInMajorInspection.mockResolvedValue(1);

    // ======================================================================
    // Default IHiveInspectionHiveHistoryQueries implementations
    // ======================================================================
    mockRepo.findAllByHiveId.mockResolvedValue([this.mockHiveInspectionRetrieved]);
    mockRepo.findAllByHiveIdAndDateRange.mockResolvedValue([this.mockHiveInspectionRetrieved]);
    mockRepo.updateInHive.mockResolvedValue([1, [this.mockHiveInspectionRetrieved]]);
    mockRepo.deleteInHive.mockResolvedValue(1);

    // ======================================================================
    // Default IHiveInspectionSecurityQueries implementations
    // ======================================================================
    mockRepo.findHiveInspectionByMajorInspectionLocationAndUser.mockResolvedValue(this.mockHiveInspectionRetrieved);
    mockRepo.findHiveInspectionByHiveLocationAndUser.mockResolvedValue(this.mockHiveInspectionRetrieved);

    return mockRepo;
  }
}
