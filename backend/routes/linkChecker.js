import express from 'express';
import { body, param, query } from 'express-validator';
import { startLinkCheck, getLinkCheckStatus, getSavedLinkCheck, listSavedLinkChecks } from '../controllers/linkCheckerController.js';
import { validate } from '../middleware/validators.js';

const router = express.Router();

// POST /api/link-checker -> start job
router.post('/link-checker',
  [ body('url').isURL().withMessage('Valid URL required'), validate ],
  startLinkCheck
);

// GET /api/link-checker/jobs/:id/status -> progress
router.get('/link-checker/jobs/:id/status',
  [ param('id').isString(), validate ],
  getLinkCheckStatus
);

// GET /api/link-checker/:id -> saved result
router.get('/link-checker/:id',
  [ param('id').isInt().withMessage('Numeric id required'), validate ],
  getSavedLinkCheck
);

// GET /api/link-checker -> list
router.get('/link-checker',
  [ query('limit').optional().isInt({ min:1, max:100 }), query('offset').optional().isInt({ min:0 }), validate ],
  listSavedLinkChecks
);

export default router;
