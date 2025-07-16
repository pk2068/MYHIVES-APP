// src/services/locationService.ts

// import { Location } from '../database/models-obsolete/Location.js';
// import { Location as LocationInterface } from '../types/models.js'; // Import the interface
import { locations as locationsModel, locationsAttributes } from '../database/models-ts/locations.js';
//import {LocationCreationAttributes} from '../database/models/Location.js'; // Import the creation attributes type
//import { CreateLocationDto } from '../types/dtos.js'; // <-- IMPORT THE NEW DTO

export class LocationService {
  /**
   * Creates a new location for a given user.
   * @param userId The ID of the user creating the location.
   * @param locationData The data for the new location.
   * @returns The created location.
   */
  public static async createLocation(userId: string, locationData: locationsAttributes): Promise<locationsAttributes> {
    const newLocation = await locationsModel.create({ ...locationData, user_id: userId });
    return newLocation.toJSON(); // Return plain JSON object
  }

  /**
   * Retrieves all locations for a specific user.
   * @param userId The ID of the user.
   * @returns An array of locations.
   */
  public static async getLocationsByUserId(userId: string): Promise<locationsAttributes[]> {
    const locations = await locationsModel.findAll({ where: { user_id: userId } });
    return locations.map((loc) => loc.toJSON());
  }

  /**
   * Retrieves a single location by its ID, ensuring it belongs to the given user.
   * @param locationId The ID of the location.
   * @param userId The ID of the user.
   * @returns The location or null if not found or not owned by user.
   */
  public static async getLocationById(locationId: string, userId: string): Promise<locationsAttributes | null> {
    const location = await locationsModel.findOne({ where: { location_id: locationId, user_id: userId } });
    return location ? location.toJSON() : null;
  }

  /**
   * Updates an existing location.
   * @param locationId The ID of the location to update.
   * @param userId The ID of the user (for authorization).
   * @param updateData The data to update.
   * @returns The updated location or null if not found or not owned.
   */
  public static async updateLocation(locationId: string, userId: string, updateData: Partial<locationsAttributes>): Promise<locationsAttributes | null> {
    const [numberOfAffectedRows, affectedRows] = await locationsModel.update(updateData, {
      where: { location_id: locationId, user_id: userId },
      returning: true, // Return the updated record(s)
    });

    if (numberOfAffectedRows === 0) {
      return null; // Location not found or not owned by user
    }
    return affectedRows[0].toJSON();
  }

  /**
   * Deletes a location.
   * @param locationId The ID of the location to delete.
   * @param userId The ID of the user (for authorization).
   * @returns True if deleted, false if not found or not owned.
   */
  public static async deleteLocation(locationId: string, userId: string): Promise<boolean> {
    const deletedRows = await locationsModel.destroy({
      where: { location_id: locationId, user_id: userId },
    });
    return deletedRows > 0;
  }
}
