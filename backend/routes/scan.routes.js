import express from 'express';
import { 
  scanWebsite, 
  getScanResults,
  getScanStatus,
  getScanProgressEndpoint,
  retryFailedServicesEndpoint,
  getRetryStatusEndpoint
} from '../controllers/scan.controller.js';
import { 
  userContextMiddleware, 
  enforcePlanLimits 
} from '../middleware/userContext.middleware.js';

const router = express.Router();

// Apply user context middleware to all scan routes
router.use(userContextMiddleware);

// POST /api/scan - Start a new website scan (with daily limit enforcement)
router.post('/', enforcePlanLimits('CREATE_SCAN'), scanWebsite);

// GET /api/scan/:scanId/results - Get scan results (legacy endpoint)
router.get('/:scanId/results', getScanResults);

// GET /api/scan/:scanId/status - Get current scan status (polling endpoint)  
router.get('/:scanId/status', getScanStatus);

// GET /api/scan/:scanId - Get current scan status (polling endpoint - alias)
router.get('/:scanId', getScanStatus);

// GET /api/scan/:scanId/progress - Get scan progress (lightweight endpoint)
router.get('/:scanId/progress', getScanProgressEndpoint);

// POST /api/scan/:scanId/retry - Retry failed services (with retry limit enforcement)
router.post('/:scanId/retry', enforcePlanLimits('RETRY_SCAN'), retryFailedServicesEndpoint);

// GET /api/scan/:scanId/retry/status - Get retry information
router.get('/:scanId/retry/status', getRetryStatusEndpoint);

export default router;
