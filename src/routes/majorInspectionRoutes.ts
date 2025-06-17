// src/routes/majorInspectionRoutes.ts (Adjusted Schema)

import { Router } from 'express';
// ... other imports ...
import Joi from 'joi';

const router = Router();

// Joi Schema for Create Major Inspection
const createMajorInspectionSchema = Joi.object({
  locationId: Joi.string().uuid().required(),
  inspectionDate: Joi.string().isoDate().required(), // <-- CHANGED FROM 'date' TO 'inspectionDate'
  generalNotes: Joi.string().trim().max(1000).allow(null, ''),
});

// Joi Schema for Update Major Inspection (properties are optional)
const updateMajorInspectionSchema = Joi.object({
  locationId: Joi.string().uuid(),
  inspectionDate: Joi.string().isoDate(), // <-- CHANGED FROM 'date' TO 'inspectionDate'
  generalNotes: Joi.string().trim().max(1000).allow(null, ''),
});

// ... (rest of the route file remains the same) ...

router.use(authenticate);

router.route('/')
  .post(validate({ body: createMajorInspectionSchema }), createMajorInspection)
  .get(getMajorInspections);

router.route('/:id')
  .get(getMajorInspectionById)
  .put(validate({ body: updateMajorInspectionSchema }), updateMajorInspection)
  .delete(deleteMajorInspection);

export default router;