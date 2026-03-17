import { Router } from 'express';
import { MetadataController } from '../controllers/metadata-controller.js';
import { MetadataService } from '../services/metadata-service.js';
import { MetadataRepository } from '../repositories/implementations/metadata-repository.js';
import { isAuthenticated, isAuthorized } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/permission.js';
import { validate } from '../middleware/validate.js';
import { createMetadataSchema, addMetadataSchema, deleteMetadataSchema } from '../validation/metadata-validation.js';

const router = Router();

// --- Dependency Injection ---
const metadataRepository = new MetadataRepository();
const metadataService = new MetadataService(metadataRepository);
const metadataController = new MetadataController(metadataService);

// --- Routes ---

/**
 * @route GET /api/v1/metadata
 * @description Get all metadata lookup values.
 * @access Public
 */
router.get('/', metadataController.getAllMetadata);

/**
 * @route POST /api/v1/metadata/seed
 * @description Create/Seed the entire metadata structure from a single payload.
 * @access Private (Admin only)
 */
router.post('/seed', isAuthenticated, isAuthorized(['admin']), validate(createMetadataSchema), metadataController.createMetadata);

/**
 * @route POST /api/v1/metadata/:category
 * @description Replace all items in a specific metadata category.
 * @access Private (Admin only)
 */
router.post('/:category', isAuthenticated, isAuthorized(['admin']), validate(addMetadataSchema), metadataController.addMetadata);

/**
 * @route DELETE /api/v1/metadata/:category
 * @description Delete specific items from a category by their IDs.
 * @access Private (Admin only)
 */
router.delete('/:category', isAuthenticated, isAuthorized(['admin']), validate(deleteMetadataSchema), metadataController.deleteMetadata);

export default router;
