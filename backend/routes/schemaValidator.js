import express from 'express';
import { query } from 'express-validator';
import { runSchemaValidation } from '../controllers/schemaValidatorController.js';
import { validate } from '../middleware/validators.js';

const router = express.Router();

// GET /api/schema-validator?url=
router.get('/schema-validator', [ query('url').isURL(), validate ], runSchemaValidation);

export default router;
