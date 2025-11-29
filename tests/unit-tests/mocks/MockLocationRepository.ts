import { jest } from '@jest/globals';
import { ILocationRepository } from '../../../src/repositories/interfaces/i-location-repository.ts';
import { LocationServiceCreateDTO, LocationServiceUpdateDTO, LocationServiceRetrievedDTO } from '../../../src/services/dto/location-service.dto.ts';
// --- Interfaces for Location DTOs (Mimicking the service DTOs) ---

// export interface LocationServiceRetrievedDTO {
//   location_id: string;
//   user_id: string;
//   name: string;
//   address: string | null;
//   latitude: number | null;
//   longitude: number | null;
//   created_at: Date;
//   updated_at: Date;
// }

// export interface LocationServiceCreateDTO {
//   user_id: string;
//   name: string;
//   address?: string;
//   latitude?: number;
//   longitude?: number;
// }

// export type LocationServiceUpdateDTO = Partial<LocationServiceCreateDTO>;

// --- Interface for Repository Contract ---

// export interface ILocationRepository {
//   create(location: LocationServiceCreateDTO): Promise<LocationServiceRetrievedDTO>;
//   readById(id: string): Promise<LocationServiceRetrievedDTO | null>;
//   readAllByUserId(userId: string): Promise<LocationServiceRetrievedDTO[]>;
//   update(id: string, location: LocationServiceUpdateDTO): Promise<[number, LocationServiceRetrievedDTO[]]>;
//   delete(id: string): Promise<number>;
// }

// --- Mock Data ---

export const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
export const mockLocationId = '987c6543-f21a-4d9e-b876-1937c48f2111';

export const mockLocation: LocationServiceRetrievedDTO = {
  location_id: mockLocationId,
  user_id: mockUserId,
  name: 'Backyard Apiary',
  address: '123 Bee Lane',
  latitude: '46.0',
  longitude: '14.5',
  created_at: new Date('2025-01-01T10:00:00Z'),
  updated_at: new Date('2025-01-01T10:00:00Z'),
};

// --- Mock Repository Implementation ---

/**
 * Mock implementation of ILocationRepository for unit testing the LocationService.
 */
export class MockLocationRepository implements ILocationRepository {
  // Static properties for convenient access in tests
  static mockLocation = mockLocation;
  static mockUserId = mockUserId;
  static mockLocationId = mockLocationId;

  // Jest Mocks for Repository methods
  create: jest.MockedFunction<(location: LocationServiceCreateDTO) => Promise<LocationServiceRetrievedDTO>> = jest.fn();
  findById: jest.MockedFunction<(id: string) => Promise<LocationServiceRetrievedDTO | null>> = jest.fn();
  findAllByUserId: jest.MockedFunction<(userId: string) => Promise<LocationServiceRetrievedDTO[]>> = jest.fn();
  update: jest.MockedFunction<(id: string, location: LocationServiceUpdateDTO) => Promise<[number, LocationServiceRetrievedDTO[]]>> = jest.fn();
  delete: jest.MockedFunction<(id: string) => Promise<number>> = jest.fn();
  //create = jest.fn<ILocationRepository['create']>();
  //readById = jest.fn<ILocationRepository['readById']>();
  // readAllByUserId = jest.fn<ILocationRepository['readAllByUserId']>();
  // update = jest.fn<ILocationRepository['update']>();
  //delete = jest.fn<ILocationRepository['delete']>();

  /**
   * Helper function to create a new mock instance with clear mocks.
   */
  static createMockInstance(): MockLocationRepository {
    return new MockLocationRepository();
  }
}
