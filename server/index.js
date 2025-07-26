// index.js
require('dotenv').config();                // if you use a .env file
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const jwt         = require('jsonwebtoken');
const wantedRouter = require('./routes/wanted');
const cacheService = require('./services/cacheService');

// Create and configure the Express app
function createApp() {
  const app = express();
  
  // Security middleware
  app.use(helmet());
  
  // CORS configuration
  app.use(cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  app.use(express.json());

  // JWT Authentication middleware
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: { message: 'Access token required', status: 401 } });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
      if (err) {
        return res.status(403).json({ error: { message: 'Invalid or expired token', status: 403 } });
      }
      req.user = user;
      next();
    });
  };

  // Apply authentication to all wanted routes
  app.use('/api/wanted', authenticateToken, wantedRouter);

  // Login endpoint
  app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Simple authentication (in production, use proper password hashing)
    if (username === 'admin' && password === 'admin') {
      const token = jwt.sign(
        { username: username, role: 'admin' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        token: token,
        user: { username: username, role: 'admin' }
      });
    } else {
      res.status(401).json({
        error: { message: 'Invalid credentials', status: 401 }
      });
    }
  });

  // Cache management endpoints
  app.get('/api/cache/stats', (_req, res) => {
    res.json({
      status: 'ok',
      cache: 'enhanced-memory',
      stats: cacheService.getStats()
    });
  });

  app.post('/api/cache/clear', (_req, res) => {
    cacheService.clear();
    res.json({ 
      status: 'ok', 
      message: 'Cache cleared successfully',
      stats: cacheService.getStats()
    });
  });

  app.post('/api/cache/warmup', async (_req, res) => {
    try {
      await cacheService.warmup();
      res.json({ 
        status: 'ok', 
        message: 'Cache warmup completed',
        stats: cacheService.getStats()
      });
    } catch (error) {
      res.status(500).json({ 
        error: { message: 'Cache warmup failed', status: 500 }
      });
    }
  });

  // Simple health endpoint
  app.get('/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      cache: 'enhanced-memory',
      stats: cacheService.getStats()
    });
  });

  // 404 handler for unknown routes
  app.use((req, res) => {
    res.status(404).json({
      error: { message: 'Route not found', status: 404 }
    });
  });

  return app;
}

// Only start the server if this file is run directly (not during testing)
if (require.main === module) {
  const app = createApp();
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`🚀 Server listening on http://localhost:${PORT}`)
  );
}

// Export the app for testing
module.exports = createApp;