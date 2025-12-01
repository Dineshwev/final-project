// middleware/auth.js
/**
 * Verifies authentication token
 * In a real app, this would validate a JWT token
 * For this example, we're allowing all requests through
 */
export const verifyToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // In a real app, you would verify the token here
    // For this example, we'll just attach a mock user object
    req.user = {
      uid: 'demo-user',
      email: 'demo@example.com',
      displayName: 'Demo User'
    };
  }
  
  // Continue even without authentication for demo purposes
  next();
};