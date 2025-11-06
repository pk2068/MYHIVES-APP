// src/services/majorInspectionService.ts

//import { MajorInspection } from '../database/models-obsolete/MajorInspection.js'  ;
import { major_inspections } from '../database/models-ts/major-inspections.js'; // Updated to use the new TypeScript model
import { major_inspectionsAttributes } from '../database/models-ts/major-inspections.js'; // Importing the type for major inspection attributes
import { locations } from '../database/models-ts/locations.js';
//import { MajorInspection as MajorInspectionInterface } from '../types/models.js';
//import {MajorInspectionCreationAttributes} from '../database/models/MajorInspection'; // Import the creation attributes type
//import { CreateMajorInspectionDto, UpdateHiveInspectionDto, UpdateMajorInspectionDto } from '../types/dtos.js'; // <-- IMPORT THE NEW DTO

export class MajorInspectionService {
  public static async createMajorInspection(location_id: string, inspectionData: major_inspectionsAttributes): Promise<major_inspectionsAttributes> {
    console.log('Creating major inspection with data:', location_id, inspectionData);
    // Convert inspectionDate string from DTO to a Date object
    const newInspectionDate = new Date(inspectionData.inspection_date);

    // Create the object to be passed to Sequelize.create()
    const inspectionDataForCreation = {
      ...inspectionData,
      //inspection_date: new Date(inspectionData.inspection_date),
      location_id: location_id, // Ensure the location_id is set correctly
    };

    console.log('Inspection data for creation via sequelize:', inspectionDataForCreation);
    const newMajorInspection = await major_inspections.create({
      ...inspectionDataForCreation,
    });

    return newMajorInspection.toJSON();
  }

  public static async getMajorInspectionsByLocationId(locationId: string): Promise<major_inspectionsAttributes[]> {
    const majorInspections = await major_inspections.findAll({
      where: { location_id: locationId },
      order: [['inspection_date', 'DESC']],
    });
    return majorInspections.map((mi) => mi.toJSON());
  }

  public static async getMajorInspectionById(
    // ZAKAJ MI TO 2x klice z razlicnim vrstnim redom argumentov???????????
    userId: string, // Check ownership by userId
    majorInspectionId: string,
    locationId: string
  ): Promise<major_inspectionsAttributes | null> {
    console.log(`Fetching major inspection by ID...\nmajorInspectionId: ${majorInspectionId}\nlocationId: ${locationId}\nuserId: ${userId}`);

    try {
      const majorInspection = await major_inspections.findOne({
        where: { major_inspection_id: majorInspectionId, location_id: locationId },
      });
    } catch (error) {
      console.error('TEST Error fetching major inspection by ID:', error);
    }

    const majorInspection = await major_inspections.findOne({
      where: { major_inspection_id: majorInspectionId, location_id: locationId },
      include: [
        {
          association: 'majorInspection_location', // Make sure this matches your association name in the MajorInspection model

          where: { location_id: locationId, user_id: userId }, // Ensure the location belongs to the user
          required: true,
        },
      ],
    });
    return majorInspection ? majorInspection.toJSON() : null;
  }

  public static async updateMajorInspection(
    locationId: string,
    majorInspectionId: string,
    updateData: major_inspectionsAttributes
    // Partial<MajorInspectionInterface>
  ): Promise<major_inspectionsAttributes | null> {
    console.log('Updating major inspection service..', majorInspectionId, locationId, updateData);
    const [numberOfAffectedRows, affectedRows] = await major_inspections.update(updateData, {
      where: { location_id: locationId, major_inspection_id: majorInspectionId },
      returning: true,
    });

    if (numberOfAffectedRows === 0) {
      return null;
    }
    return affectedRows[0].toJSON();
  }

  public static async deleteMajorInspection(userId: string, locationId: string, majorInspectionId: string): Promise<boolean> {
    console.log('Deleting major inspection service..', majorInspectionId, locationId, userId);
    // Step 1: Find the major inspection ID that matches all criteria
    const majorInspectionToDelete = await major_inspections.findOne({
      attributes: ['major_inspection_id'], // Only select the ID to minimize data transfer
      where: {
        major_inspection_id: majorInspectionId,
      },
      include: [
        {
          model: locations,
          //as: 'location', // Ensure this matches your association alias
          as: 'majorInspection_location',
          attributes: [],
          where: {
            location_id: locationId,
            user_id: userId, // Ensure the location belongs to the user
          },
          required: true, // This acts as an INNER JOIN, ensuring all conditions must be met
        },
      ],
    });

    if (!majorInspectionToDelete) {
      // No matching major inspection found for the given user, location, and majorInspectionId
      return false;
    }

    // Step 2: Delete the identified major inspection
    const deletedRows = await major_inspections.destroy({
      where: {
        major_inspection_id: majorInspectionToDelete.toJSON().major_inspection_id,
      },
    });

    return deletedRows > 0;
  }
}
