// src/services/locationService.ts

import { Location } from '../database/models/Location';
import { Location as LocationInterface } from '../types/models'; // Import the interface
import {LocationCreationAttributes} from '../database/models/Location'; // Import the creation attributes type
import { CreateLocationDto } from '../types/dtos'; // <-- IMPORT THE NEW DTO

export class LocationService {
  /**
   * Creates a new location for a given user.
   * @param userId The ID of the user creating the location.
   * @param locationData The data for the new location.
   * @returns The created location.
   */
  public static async createLocation(
    userId: string, 
    locationData: CreateLocationDto ): Promise<LocationInterface> {
    const newLocation = await Location.create({ ...locationData, userId });
    return newLocation.toJSON(); // Return plain JSON object
  }

  /**
   * Retrieves all locations for a specific user.
   * @param userId The ID of the user.
   * @returns An array of locations.
   */
  public static async getLocationsByUserId(userId: string): Promise<LocationInterface[]> {
    const locations = await Location.findAll({ where: { userId } });
    return locations.map(loc => loc.toJSON());
  }

  /**
   * Retrieves a single location by its ID, ensuring it belongs to the given user.
   * @param id The ID of the location.
   * @param userId The ID of the user.
   * @returns The location or null if not found or not owned by user.
   */
  public static async getLocationById(id: string, userId: string): Promise<LocationInterface | null> {
    const location = await Location.findOne({ where: { id, userId } });
    return location ? location.toJSON() : null;
  }

  /**
   * Updates an existing location.
   * @param id The ID of the location to update.
   * @param userId The ID of the user (for authorization).
   * @param updateData The data to update.
   * @returns The updated location or null if not found or not owned.
   */
  public static async updateLocation(id: string, userId: string, updateData: Partial<LocationInterface>): Promise<LocationInterface | null> {
    const [numberOfAffectedRows, affectedRows] = await Location.update(updateData, {
      where: { id, userId },
      returning: true, // Return the updated record(s)
    });

    if (numberOfAffectedRows === 0) {
      return null; // Location not found or not owned by user
    }
    return affectedRows[0].toJSON();
  }

  /**
   * Deletes a location.
   * @param id The ID of the location to delete.
   * @param userId The ID of the user (for authorization).
   * @returns True if deleted, false if not found or not owned.
   */
  public static async deleteLocation(id: string, userId: string): Promise<boolean> {
    const deletedRows = await Location.destroy({
      where: { id, userId },
    });
    return deletedRows > 0;
  }
}