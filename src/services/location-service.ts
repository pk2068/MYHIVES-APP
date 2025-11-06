import { locations as locationsModel, locationsAttributes } from '../database/models-ts/locations.js';
import { ILocationRepository } from '../repositories/interfaces/i-location-repository.js';
import { LocationServiceRetrievedDTO, LocationServiceCreateDTO, LocationServiceUpdateDTO } from './dto/location-service.dto.js';
import { CustomError } from '../middleware/errorHandler.js';
import httpStatus from 'http-status';

export class LocationService {
  private readonly locationRepository: ILocationRepository;

  // Dependency Injection: Injecting the repository contract
  constructor(locationRepository: ILocationRepository) {
    this.locationRepository = locationRepository;
  }

  /**
   * Creates a new location entry.
   * @param locationData The data for the new location, including user_id.
   * @returns The created location DTO.
   */
  public async createLocation(locationData: LocationServiceCreateDTO): Promise<LocationServiceRetrievedDTO> {
    // No complex business logic here yet (e.g., uniqueness checks), so delegate directly.
    return this.locationRepository.create(locationData);
  }

  /**
   * Retrieves all locations belonging to a specific user.
   * @param userId The ID of the owner.
   * @returns An array of location DTOs.
   */
  public async getAllLocationsByUserId(userId: string): Promise<LocationServiceRetrievedDTO[]> {
    return this.locationRepository.readAllByUserId(userId);
  }

  /**
   * Retrieves a single location by its ID, ensuring it belongs to the given user.
   * @param locationId The ID of the location.
   * @param userId The ID of the user.
   * @returns The location or null if not found or not owned by user.
   */
  public async getLocationById(locationId: string): Promise<LocationServiceRetrievedDTO | null> {
    const _loc = await this.locationRepository.readById(locationId);
    return _loc;
  }

  /**
   * Updates an existing location.
   * @param locationId The ID of the location to update.
   * @param updateData The fields to update.
   * @returns The updated location DTO.
   */
  public async updateLocation(locationId: string, updateData: LocationServiceUpdateDTO): Promise<LocationServiceRetrievedDTO> {
    // Check if the location exists before updating
    const existingLocation = await this.locationRepository.readById(locationId);
    if (!existingLocation) {
      const error = new Error('Location not found.') as CustomError;
      error.statusCode = httpStatus.NOT_FOUND; // 404
      throw error;
    }

    const [updatedCount, updatedLocations] = await this.locationRepository.update(locationId, updateData);

    if (updatedCount > 1) {
      // This error indicates a serious issue in the repository or ORM logic
      const error = new Error(`Failed to update location with ID ${locationId}. Concurrency issue suspected.`) as CustomError;
      error.statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      throw error;
    }
    if (updatedCount === 0) {
      // Should not happen after the initial existence check, but is a safety net
      const error = new Error(`Location with ID ${locationId} not found during update.`) as CustomError;
      error.statusCode = httpStatus.NOT_FOUND;
      throw error;
    }

    // Return the single updated location DTO
    return updatedLocations[0];
  }

  /**
   * Deletes a location.
   * @param locationId The ID of the location to delete.
   * @returns The number of records deleted (should be 1).
   */
  public async deleteLocation(locationId: string): Promise<number> {
    // Optional: Add pre-delete check or business logic here (e.g., cannot delete if hives are present)
    return this.locationRepository.delete(locationId);
  }

  /**
   * Checks if a location is owned by a specific user. Helpful for authorization middleware checks
   * @param locationId The ID of the location.
   * @param userId The ID of the user.
   * @returns True if the location is owned by the user, false otherwise.
   */
  public static async checkLocationOwnership(locationId: string, userId: string): Promise<boolean> {
    const location = await locationsModel.findByPk(locationId);
    return location ? location.user_id === userId : false;
  }
}
