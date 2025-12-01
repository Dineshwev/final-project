import express from 'express';
import { addKeywordHandler, listKeywordsHandler, deleteKeywordHandler, historyHandler, alertsHandler, markAlertHandler, refreshOneHandler, refreshAllHandler, exportHistoryCsvHandler, exportAlertsCsvHandler } from '../controllers/rankTrackerController.js';

const router = express.Router();

router.post('/', addKeywordHandler);
router.get('/', listKeywordsHandler);
router.delete('/:id', deleteKeywordHandler);
router.get('/:id/history', historyHandler);
router.get('/:id/history/export.csv', exportHistoryCsvHandler);
router.get('/alerts/list', alertsHandler);
router.get('/alerts/export.csv', exportAlertsCsvHandler);
router.post('/alerts/:id/seen', markAlertHandler);
router.post('/refresh/:id', refreshOneHandler);
router.post('/refresh-all', refreshAllHandler);

export default router;
