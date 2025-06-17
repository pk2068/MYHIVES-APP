import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../middleware/errorHandler';
import { MajorInspectionService } from '../services/majorInspectionService';
// import { MajorInspection as MajorInspectionInterface } from '../types/models'; // No longer needed for this specific line
import { CreateMajorInspectionDto } from '../types/dtos'; // <-- IMPORT THE NEW DTO

export const createMajorInspection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id; // Authenticate middleware ensures req.user.id exists
    // Change type from Partial<MajorInspectionInterface> to CreateMajorInspectionDto
    const majorInspectionData: CreateMajorInspectionDto = req.body; // <-- TYPE CHANGED

    const newMajorInspection = await MajorInspectionService.createMajorInspection(userId, majorInspectionData);

    res.status(201).json({
      success: true,
      message: 'Major Inspection created successfully',
      data: newMajorInspection,
    });
  } catch (error) {
    next(error);
  }
};

// ... (rest of the controller functions like getMajorInspections, getMajorInspectionById, etc.) ...
// For updateMajorInspection, you'd likely use Partial<CreateMajorInspectionDto> or define an UpdateMajorInspectionDto
// const updateData: Partial<MajorInspectionInterface> = req.body; // This line would stay as is if the service expects Partial<MajorInspectionInterface> for updates.