// utils/apiKeyManager.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the user data file
const USER_DATA_FILE = path.join(__dirname, '..', 'data', 'user_data.json');

/**
 * Gets API keys for a user or falls back to environment variables
 * @param {string} userId - The user ID
 * @param {string} keyName - The name of the API key
 * @returns {string} - The API key
 */
export const getApiKey = (userId, keyName) => {
    try {
        // If no user ID, use environment variables
        if (!userId) {
            return process.env[keyName.toUpperCase()];
        }
        
        // Read the user data file
        if (!fs.existsSync(USER_DATA_FILE)) {
            return process.env[keyName.toUpperCase()];
        }
        
        const userData = JSON.parse(fs.readFileSync(USER_DATA_FILE, 'utf8'));
        
        // Check if the user exists and has API keys
        if (userData.users && 
            userData.users[userId] && 
            userData.users[userId].apiKeys) {
            
            // Map keyName to the correct property in the user's apiKeys object
            const keyMap = {
                'PAGE_SPEED_INSIGHTS_API_KEY': 'pageSpeedInsightsKey',
                'WHOAPI_KEY': 'whoApiKey',
                'SAFE_BROWSING_API_KEY': 'safeBrowsingApiKey'
            };
            
            const userKey = userData.users[userId].apiKeys[keyMap[keyName.toUpperCase()]];
            
            // Use the user's key if available, otherwise fall back to environment variable
            return userKey || process.env[keyName.toUpperCase()];
        }
        
        return process.env[keyName.toUpperCase()];
    } catch (error) {
        console.error('Error getting API key:', error);
        return process.env[keyName.toUpperCase()];
    }
};