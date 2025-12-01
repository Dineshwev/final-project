import express from 'express';
import { body, query } from 'express-validator';
import { validate } from '../middleware/validators.js';
import { compareHandler } from '../controllers/compareController.js';

const router = express.Router();

// Accept GET with urls[]= or urls=comma,separated
router.get('/compare', [
  query('urls').custom((value, { req }) => {
    const urls = req.query.urls;
    const list = Array.isArray(urls) ? urls : typeof urls === 'string' ? urls.split(',') : [];
    return list.length >= 2 && list.length <= 3;
  }).withMessage('Provide 2-3 urls as query parameters')
], validate, compareHandler);

// Accept POST with { urls: string[] }
router.post('/compare', [
  body('urls').isArray({ min: 2, max: 3 }).withMessage('Provide 2-3 URLs array'),
  body('urls.*').isURL().withMessage('Each URL must be valid')
], validate, compareHandler);

export default router;
