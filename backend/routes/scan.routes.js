import express from 'express';
import { scanWebsite, getScanResults } from '../controllers/scan.controller.js';

const router = express.Router();

// POST /api/scan - Start a new website scan
router.post('/', scanWebsite);

// GET /api/scan/:scanId/results - Get scan results
router.get('/:scanId/results', getScanResults);

export default router;
