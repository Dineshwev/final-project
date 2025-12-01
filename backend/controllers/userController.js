// controllers/userController.js
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This would normally be stored in a database, but for this example
// we'll use a simple file-based approach
const USER_DATA_FILE = path.join(__dirname, '..', 'data', 'user_data.json');

// Make sure the data directory exists
if (!fs.existsSync(path.dirname(USER_DATA_FILE))) {
    fs.mkdirSync(path.dirname(USER_DATA_FILE), { recursive: true });
}

// Initialize user data file if it doesn't exist
if (!fs.existsSync(USER_DATA_FILE)) {
    fs.writeFileSync(USER_DATA_FILE, JSON.stringify({
        users: {}
    }));
}

// Helper to read user data
const readUserData = () => {
    try {
        const data = fs.readFileSync(USER_DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading user data:', error);
        return { users: {} };
    }
};

// Helper to write user data
const writeUserData = (data) => {
    try {
        fs.writeFileSync(USER_DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing user data:', error);
        return false;
    }
};

// Get user profile
export const getUserProfile = (req, res) => {
    try {
        // In a real app, this would be fetched from the database
        // using the authenticated user's ID
        const userId = req.user ? req.user.uid : 'demo-user';
        const userData = readUserData();
        
        if (!userData.users[userId]) {
            userData.users[userId] = {
                profile: {
                    displayName: req.user ? req.user.displayName : 'Demo User',
                    email: req.user ? req.user.email : 'demo@example.com',
                },
                apiKeys: {
                    pageSpeedInsightsKey: process.env.PAGE_SPEED_INSIGHTS_API_KEY || '',
                    whoApiKey: process.env.WHOAPI_KEY || '',
                    safeBrowsingApiKey: process.env.SAFE_BROWSING_API_KEY || '',
                },
                settings: {}
            };
            writeUserData(userData);
        }

        res.status(200).json({
            status: 'success',
            data: userData.users[userId].profile
        });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get user profile'
        });
    }
};

// Update user profile
export const updateUserProfile = (req, res) => {
    try {
        const userId = req.user ? req.user.uid : 'demo-user';
        const { displayName, photoURL } = req.body;
        
        const userData = readUserData();
        
        if (!userData.users[userId]) {
            userData.users[userId] = {
                profile: {},
                apiKeys: {},
                settings: {}
            };
        }
        
        userData.users[userId].profile = {
            ...userData.users[userId].profile,
            displayName: displayName || userData.users[userId].profile.displayName,
            photoURL: photoURL || userData.users[userId].profile.photoURL
        };
        
        writeUserData(userData);
        
        res.status(200).json({
            status: 'success',
            data: userData.users[userId].profile
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update user profile'
        });
    }
};

// Get user API keys
export const getApiKeys = (req, res) => {
    try {
        const userId = req.user ? req.user.uid : 'demo-user';
        const userData = readUserData();
        
        if (!userData.users[userId] || !userData.users[userId].apiKeys) {
            userData.users[userId] = {
                ...userData.users[userId],
                apiKeys: {
                    pageSpeedInsightsKey: process.env.PAGE_SPEED_INSIGHTS_API_KEY || '',
                    whoApiKey: process.env.WHOAPI_KEY || '',
                    safeBrowsingApiKey: process.env.SAFE_BROWSING_API_KEY || '',
                }
            };
            writeUserData(userData);
        }
        
        res.status(200).json({
            status: 'success',
            data: userData.users[userId].apiKeys
        });
    } catch (error) {
        console.error('Error getting API keys:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get API keys'
        });
    }
};

// Update user API keys
export const updateApiKeys = (req, res) => {
    try {
        const userId = req.user ? req.user.uid : 'demo-user';
        const { pageSpeedInsightsKey, whoApiKey, safeBrowsingApiKey } = req.body;
        
        const userData = readUserData();
        
        if (!userData.users[userId]) {
            userData.users[userId] = {
                profile: {},
                apiKeys: {},
                settings: {}
            };
        }
        
        userData.users[userId].apiKeys = {
            pageSpeedInsightsKey: pageSpeedInsightsKey || userData.users[userId].apiKeys?.pageSpeedInsightsKey || '',
            whoApiKey: whoApiKey || userData.users[userId].apiKeys?.whoApiKey || '',
            safeBrowsingApiKey: safeBrowsingApiKey || userData.users[userId].apiKeys?.safeBrowsingApiKey || '',
        };
        
        writeUserData(userData);
        
        res.status(200).json({
            status: 'success',
            data: userData.users[userId].apiKeys
        });
    } catch (error) {
        console.error('Error updating API keys:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update API keys'
        });
    }
};

// Get user settings
export const getUserSettings = (req, res) => {
    try {
        const userId = req.user ? req.user.uid : 'demo-user';
        const userData = readUserData();
        
        if (!userData.users[userId] || !userData.users[userId].settings) {
            userData.users[userId] = {
                ...userData.users[userId],
                settings: {
                    darkMode: false,
                    notifications: true,
                    language: 'en',
                }
            };
            writeUserData(userData);
        }
        
        res.status(200).json({
            status: 'success',
            data: userData.users[userId].settings
        });
    } catch (error) {
        console.error('Error getting user settings:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get user settings'
        });
    }
};

// Update user settings
export const updateUserSettings = (req, res) => {
    try {
        const userId = req.user ? req.user.uid : 'demo-user';
        const settings = req.body;
        
        const userData = readUserData();
        
        if (!userData.users[userId]) {
            userData.users[userId] = {
                profile: {},
                apiKeys: {},
                settings: {}
            };
        }
        
        userData.users[userId].settings = {
            ...userData.users[userId].settings,
            ...settings
        };
        
        writeUserData(userData);
        
        res.status(200).json({
            status: 'success',
            data: userData.users[userId].settings
        });
    } catch (error) {
        console.error('Error updating user settings:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update user settings'
        });
    }
};