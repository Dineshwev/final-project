// Simple Express server to test frontend integration
import express from 'express';
import cors from 'cors';
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the SEO Health Checker API',
    version: '1.0.0'
  });
});

// Analyze route - mock response
app.get('/api/seo/analyze', (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  // Return a mock response
  res.json({
    url: url,
    timestamp: new Date().toISOString(),
    score: 85,
    status: 'Good',
    recommendations: [
      { type: 'SEO', message: 'Add more descriptive meta tags' },
      { type: 'Performance', message: 'Optimize images for faster loading' },
      { type: 'Security', message: 'Enable HTTPS for your website' }
    ],
    metrics: {
      performance: 90,
      seo: 85,
      security: 80,
      accessibility: 70
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Simple test server running on port ${PORT}`);
});