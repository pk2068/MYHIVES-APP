import { LocationService } from '../../../src/services/location-service.ts';
import { MockLocationRepository, mockLocation, mockUserId, mockLocationId } from '../mocks/MockLocationRepository.ts'; // Use generated mock
import { ILocationRepository } from '../../../src/repositories/interfaces/i-location-repository.ts';
import { LocationServiceCreateDTO, LocationServiceUpdateDTO, LocationServiceRetrievedDTO } from '../../../src/services/dto/location-service.dto.ts';

import httpStatus from 'http-status';
import { beforeEach, describe, it, expect, jest } from '@jest/globals';

// Mock the CustomError class since it's used for error throwing in the service
// This assumes CustomError is a class that accepts a message and has a statusCode property.
class CustomError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number = httpStatus.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
  }
}

// Mock instance setup
let mockLocationRepository: MockLocationRepository;
let locationService: LocationService;

// Setup before each test
beforeEach(() => {
  // Create a clean mock instance before every test
  mockLocationRepository = MockLocationRepository.createMockInstance();

  // Inject the mock instance into the LocationService
  // @ts-ignore: We know the mock implements the required interface methods
  locationService = new LocationService(mockLocationRepository as ILocationRepository);

  // Clear mock history before each test to ensure tests are isolated
  jest.clearAllMocks();
});

describe('LocationService', () => {
  // --- createLocation tests ---
  describe('createLocation', () => {
    it('should successfully create a new location', async () => {
      // Arrange
      const newLocationData: LocationServiceCreateDTO = {
        user_id: mockUserId,
        name: 'New Location',
        latitude: '45.0',
        longitude: '15.0',
      };
      const createdLocation: LocationServiceRetrievedDTO = {
        ...mockLocation,
        ...newLocationData,
        location_id: 'new-location-id',
      };
      mockLocationRepository.create.mockResolvedValue(createdLocation);

      // Act
      const result = await locationService.createLocation(newLocationData);

      // Assert
      expect(mockLocationRepository.create).toHaveBeenCalledWith(newLocationData);
      expect(result).toEqual(createdLocation);
    });
  });

  // --- getAllLocationsByUserId tests ---
  describe('getAllLocationsByUserId', () => {
    it('should return an array of locations for a given user ID', async () => {
      // Arrange
      const locationList: LocationServiceRetrievedDTO[] = [mockLocation, { ...mockLocation, location_id: 'other-loc-id', name: 'Other Spot' }];
      //mockLocationRepository.readAllByUserId.mockResolvedValue(locationList);
      mockLocationRepository.findAllByUserId.mockResolvedValue(locationList);

      // Act
      const result = await locationService.getAllLocationsByUserId(mockUserId);

      // Assert
      expect(mockLocationRepository.findAllByUserId).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(locationList);
      expect(result.length).toBe(2);
    });

    it('should return an empty array if no locations are found for the user', async () => {
      // Arrange
      mockLocationRepository.findAllByUserId.mockResolvedValue([]);

      // Act
      const result = await locationService.getAllLocationsByUserId(mockUserId);

      // Assert
      expect(mockLocationRepository.findAllByUserId).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  // --- getLocationById tests ---
  describe('getLocationById', () => {
    it('should return a location if found by ID', async () => {
      // Arrange
      mockLocationRepository.findById.mockResolvedValue(mockLocation);

      // Act
      const result = await locationService.getLocationById(mockLocationId);

      // Assert
      expect(mockLocationRepository.findById).toHaveBeenCalledWith(mockLocationId);
      expect(result).toEqual(mockLocation);
    });

    it('should return null if no location is found', async () => {
      // Arrange
      mockLocationRepository.findById.mockResolvedValue(null);

      // Act
      const result = await locationService.getLocationById(mockLocationId);

      // Assert
      expect(mockLocationRepository.findById).toHaveBeenCalledWith(mockLocationId);
      expect(result).toBeNull();
    });
  });

  // --- updateLocation tests ---
  describe('updateLocation', () => {
    const updateData: LocationServiceUpdateDTO = { name: 'Updated Apiary Name' };
    const updatedLocation: LocationServiceRetrievedDTO = { ...mockLocation, name: 'Updated Apiary Name', updated_at: new Date() };

    it('should successfully update an existing location', async () => {
      // Arrange
      // 1. readById returns existing location
      mockLocationRepository.findById.mockResolvedValueOnce(mockLocation);
      // 2. update returns success count (1 user updated)
      mockLocationRepository.update.mockResolvedValueOnce([1, [updatedLocation]]);

      // Act
      const result = await locationService.updateLocation(mockLocationId, updateData);

      // Assert
      expect(mockLocationRepository.findById).toHaveBeenCalledWith(mockLocationId);
      expect(mockLocationRepository.update).toHaveBeenCalledWith(mockLocationId, updateData);
      expect(result).toEqual(updatedLocation);
    });

    it('should throw NOT_FOUND error if location does not exist before update', async () => {
      // Arrange
      // 1. readById returns null (location not found)
      mockLocationRepository.findById.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(locationService.updateLocation(mockLocationId, updateData)).rejects.toMatchObject({
        message: 'Location not found.',
        statusCode: httpStatus.NOT_FOUND, // 404
      });
      // Assert that update was never called
      expect(mockLocationRepository.update).not.toHaveBeenCalled();
    });

    it('should throw INTERNAL_SERVER_ERROR if repository updates > 1 location', async () => {
      // Arrange
      // 1. readById returns existing location
      mockLocationRepository.findById.mockResolvedValueOnce(mockLocation);
      // 2. update returns unexpected count (2 locations updated)
      mockLocationRepository.update.mockResolvedValueOnce([2, [updatedLocation, updatedLocation]]);

      // Act & Assert
      await expect(locationService.updateLocation(mockLocationId, updateData)).rejects.toMatchObject({
        message: expect.stringContaining(`Failed to update location with ID ${mockLocationId}. Concurrency issue suspected.`),
        statusCode: httpStatus.INTERNAL_SERVER_ERROR, // 500
      });
    });

    it('should throw NOT_FOUND error if repository returns updated count of 0 (safety net)', async () => {
      // Arrange
      // 1. readById returns existing location
      mockLocationRepository.findById.mockResolvedValueOnce(mockLocation);
      // 2. update returns 0 count (should not happen after pre-check, but testing robust code)
      mockLocationRepository.update.mockResolvedValueOnce([0, []]);

      // Act & Assert
      await expect(locationService.updateLocation(mockLocationId, updateData)).rejects.toMatchObject({
        message: expect.stringContaining(`Location with ID ${mockLocationId} not found during update.`),
        statusCode: httpStatus.NOT_FOUND, // 404
      });
    });
  });

  // --- deleteLocation tests ---
  describe('deleteLocation', () => {
    it('should successfully delete a location and return 1 (records deleted)', async () => {
      // Arrange
      mockLocationRepository.delete.mockResolvedValue(1);

      // Act
      const result = await locationService.deleteLocation(mockLocationId);

      // Assert
      expect(mockLocationRepository.delete).toHaveBeenCalledWith(mockLocationId);
      expect(result).toBe(1);
    });

    it('should return 0 if no location was deleted', async () => {
      // Arrange
      mockLocationRepository.delete.mockResolvedValue(0);

      // Act
      const result = await locationService.deleteLocation(mockLocationId);

      // Assert
      expect(mockLocationRepository.delete).toHaveBeenCalledWith(mockLocationId);
      expect(result).toBe(0);
    });
  });
});
