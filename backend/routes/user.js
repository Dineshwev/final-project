// routes/user.js
import express from 'express';
import { 
    getUserProfile, 
    updateUserProfile, 
    getApiKeys, 
    updateApiKeys,
    getUserSettings,
    updateUserSettings
} from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// User profile routes
router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, updateUserProfile);

// API keys routes
router.get('/api-keys', verifyToken, getApiKeys);
router.put('/api-keys', verifyToken, updateApiKeys);

// User settings routes
router.get('/settings', verifyToken, getUserSettings);
router.put('/settings', verifyToken, updateUserSettings);

export default router;