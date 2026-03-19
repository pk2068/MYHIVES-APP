import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { MetadataService } from '../services/metadata-service.js';
import { FullMetadataDTO, MetadataCategory, LookupItem } from '../types/metadata-types.js';
import { CustomError } from '../middleware/errorHandler.js';

export class MetadataController {
  private readonly _metadataService: MetadataService;

  constructor(metadataService: MetadataService) {
    this._metadataService = metadataService;
  }

  // GET /api/metadata
  public getAllMetadata = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._metadataService.getAllMetadata();
      res.status(httpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/metadata/seed - Create/Seed full metadata structure
  public createMetadata = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fullData: FullMetadataDTO = req.body;
      await this._metadataService.createMetadata(fullData);
      res.status(httpStatus.CREATED).json({
        success: true,
        message: 'Full metadata created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/metadata/:category - Replace all items in a specific category
  public addMetadata = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.params;
      const data: LookupItem[] = req.body; // Expect array of objects {id?, name}

      // Note: Joi validation middleware should ideally validate that 'category' is a valid MetadataCategory
      await this._metadataService.addMetadata(category as MetadataCategory, data);

      res.status(httpStatus.OK).json({
        success: true,
        message: `Metadata for category '${category}' updated successfully`,
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/metadata/:category - Delete specific items by ID
  public deleteMetadata = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.params;
      const { ids } = req.body; // Expecting { ids: [1, 2, 3] }

      const count = await this._metadataService.deleteMetadata(category as MetadataCategory, ids);

      if (count === 0) {
        const error = new Error('No records found to delete.') as CustomError;
        error.statusCode = httpStatus.NOT_FOUND;
        throw error;
      }

      res.status(httpStatus.OK).json({
        success: true,
        message: `${count} records deleted successfully from '${category}'`,
      });
    } catch (error) {
      next(error);
    }
  };

  setMetadataStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, id } = req.params;
      const { is_active } = req.body;

      // Cast category to MetadataCategory type if needed, or validate it before this point
      await this._metadataService.setMetadataStatus(category as MetadataCategory, Number(id), Boolean(is_active));

      res.status(200).json({
        message: `Metadata item ${id} in ${category} is now ${is_active ? 'active' : 'inactive'}`,
      });
    } catch (error) {
      next(error);
    }
  };
}
