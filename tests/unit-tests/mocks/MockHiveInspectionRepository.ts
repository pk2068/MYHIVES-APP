import { HiveInspectionServiceCreateDTO, HiveInspectionServiceRetrievedDTO, HiveInspectionServiceUpdateDTO } from '../../../src/services/dto/hive-inspection-service.dto.js';
import { IHiveInspectionRepository } from '../../../src/repositories/interfaces/i-hive-inspection-repository.js';
import { jest } from '@jest/globals';

// define the shape of a mock hive inspection for testing purposes
const userId = 'user-uuid-123';
const hiveId = 'hive-uuid-456';
const hiveInspectionId = 'hive-inspection-uuid-789';
const majorInspectionId = 'major-inspection-uuid-101112';

const mockHiveInspectionRetrieved: HiveInspectionServiceRetrievedDTO = {
  hive_inspection_id: hiveInspectionId,
  hive_id: hiveId,
  major_inspection_id: majorInspectionId,
  inspection_time: new Date('2023-01-01T00:00:00Z').toDateString,
  colony_health_status_id: 1,
  num_chambers: 1,
  brood_frames_count: 6,
  brood_percentage: 30, // no longer string
  queen_status_id: 1,
  approx_honey_weight_kg: 45,
  drone_comb_frames_count: 2,
  drone_comb_percentage: 5, // no longer string
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
};

const mockHiveInspectionCreationData: HiveInspectionServiceCreateDTO = {
  hive_id: 'mock-hive-1',
  major_inspection_id: 'mock-major-1',
  inspection_date: new Date('2023-01-01T00:00:00Z').toDateString,
  colony_health_status_id: 1,
  num_chambers: 1,
  brood_frames_count: 6,
  brood_percentage: 30, // no longer string
  queen_status_id: 1,
  approx_honey_weight_kg: 45,
  drone_comb_frames_count: 2,
  drone_comb_percentage: 5, // no longer string
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

// --- MOCK IMPLEMENTATION ---
// Implement the interface with Jest mock functions
export class MockHiveInspectionRepository implements IHiveInspectionRepository {
  // CRUD Methods
  create: jest.MockedFunction<(inspection: HiveInspectionServiceCreateDTO) => Promise<HiveInspectionServiceRetrievedDTO>> = jest.fn();
  update: jest.MockedFunction<(inspectionId: string, hiveId: string, inspection: HiveInspectionServiceUpdateDTO) => Promise<[number, HiveInspectionServiceRetrievedDTO[]]>> =
    jest.fn();
  findById: jest.MockedFunction<(inspectionId: string, hiveId?: string) => Promise<HiveInspectionServiceRetrievedDTO | null>> = jest.fn();
  findAllByHiveId: jest.MockedFunction<(hiveId: string) => Promise<HiveInspectionServiceRetrievedDTO[]>> = jest.fn();
  findAllByMajorInspectionId: jest.MockedFunction<(majorInspectionId: string) => Promise<HiveInspectionServiceRetrievedDTO[]>> = jest.fn();
  delete: jest.MockedFunction<(inspectionId: string, hiveId?: string) => Promise<number>> = jest.fn();
  findHiveInspectionByHiveAndUser: jest.MockedFunction<(inspectionId: string, hiveId: string, userId: string) => Promise<HiveInspectionServiceRetrievedDTO | null>> = jest.fn();

  // Helper properties and methods for test setup
  public static mockHiveInspectionRetrieved = mockHiveInspectionRetrieved;
  public static mockHiveInspectionCreationData = mockHiveInspectionCreationData;
  public static mockHiveInspectionUpdateData = mockHiveInspectionUpdateData;
  public static mockHiveMajorInspectionId: string = mockHiveInspectionRetrieved.major_inspection_id;
  public static mockHiveId: string = mockHiveInspectionRetrieved.hive_id;
  public static mockUserId: string = userId;

  // Static method to create an instance and set default behaviors
  public static createMockInstance(): MockHiveInspectionRepository {
    const mockRepo = new MockHiveInspectionRepository();

    // Default mock implementations for successful scenarios--
    mockRepo.create.mockResolvedValue(this.mockHiveInspectionRetrieved);
    mockRepo.update.mockResolvedValue([1, [this.mockHiveInspectionRetrieved]]);
    mockRepo.findById.mockResolvedValue(this.mockHiveInspectionRetrieved);
    mockRepo.findAllByHiveId.mockResolvedValue([this.mockHiveInspectionRetrieved]);
    mockRepo.findAllByMajorInspectionId.mockResolvedValue([this.mockHiveInspectionRetrieved]);
    mockRepo.delete.mockResolvedValue(1);
    mockRepo.findHiveInspectionByHiveAndUser.mockResolvedValue(this.mockHiveInspectionRetrieved);

    return mockRepo;
  }
}
