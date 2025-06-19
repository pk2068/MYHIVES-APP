// src/services/majorInspectionService.ts

import { MajorInspection } from '../database/models/MajorInspection';
import { MajorInspection as MajorInspectionInterface } from '../types/models';
//import {MajorInspectionCreationAttributes} from '../database/models/MajorInspection'; // Import the creation attributes type
import { CreateMajorInspectionDto, UpdateHiveInspectionDto, UpdateMajorInspectionDto } from '../types/dtos'; // <-- IMPORT THE NEW DTO


export class MajorInspectionService {
  public static async createMajorInspection(
    userId: string,
    inspectionData: CreateMajorInspectionDto
  ): Promise<MajorInspectionInterface> {

    // Convert inspectionDate string from DTO to a Date object
    const newInspectionDate = new Date(inspectionData.inspectionDate);

    // Create the object to be passed to Sequelize.create()
    const inspectionDataForCreation = {
      ...inspectionData,
      inspectionDate: newInspectionDate, // Use the converted Date object
      userId: userId, // Assuming userId is passed from the controller and is the correct foreign key
                      // If your MajorInspection model links to Location, then it should be locationId here
                      // and `locationId` needs to be part of the `CreateMajorInspectionDto`.
                      // BASED ON YOUR LATEST MAJORINSPECTIONDTO, `locationId` is in the DTO,
                      // SO THE FIRST ARGUMENT TO THIS SERVICE FUNCTION SHOULD BE `locationId: string`.
                      // Let's correct this based on the common flow for major inspections:
                      // A major inspection belongs to a specific location, and that location belongs to a user.
                      // So the `createMajorInspection` service function will likely take `userId` AND `locationId`
                      // if you need to verify ownership of the location before creating the inspection.

    };
    const newMajorInspection = await MajorInspection.create({
      // // Use the converted date
      // inspectionDate: newInspectionDate,
      // // Pass other data from the DTO
      // generalNotes: inspectionData.generalNotes,
      // locationId: inspectionData.locationId, // locationId comes from the DTO
      // userId: userId, // userId comes from the first argument (req.user!.id)
      ...inspectionDataForCreation
    });

     return newMajorInspection.toJSON();
  }

  public static async getMajorInspectionsByLocationId(
    locationId: string
  ): Promise<MajorInspectionInterface[]> {
    const majorInspections = await MajorInspection.findAll({ where: { locationId }, order: [['inspectionDate', 'DESC']] });
    return majorInspections.map(mi => mi.toJSON());
  }

  public static async getMajorInspectionById(
    id: string,
    locationId: string,
    userId: string // Check ownership by userId
  ): Promise<MajorInspectionInterface | null> {
    const majorInspection = await MajorInspection.findOne({
      where: { id, locationId },
      include: [
        {
          association: 'location', // Make sure this matches your association name in the MajorInspection model
          where: { userId },
          required: true,
        },
      ],
    });
    return majorInspection ? majorInspection.toJSON() : null;
  }

  public static async updateMajorInspection(
    id: string,
    locationId: string,
    updateData: UpdateMajorInspectionDto
     // Partial<MajorInspectionInterface>
  ): Promise<MajorInspectionInterface | null> {

    // create new date variable and the create new object with that variable and then this object will be passed to the update method
    let newDate = updateData.inspectionDate ? new Date(updateData.inspectionDate) : new Date();
    let newUpdateDataForUpdate  = { ...updateData, 
      inspectionDate: newDate // Use the converted Date object
     };


    const [numberOfAffectedRows, affectedRows] = await MajorInspection.update(newUpdateDataForUpdate, {
      where: { id, locationId },
      returning: true,
    });

    if (numberOfAffectedRows === 0) {
      return null;
    }
    return affectedRows[0].toJSON();
  }

  public static async deleteMajorInspection(
    id: string,
    locationId: string
  ): Promise<boolean> {
    const deletedRows = await MajorInspection.destroy({
      where: { id, locationId },
    });
    return deletedRows > 0;
  }
}