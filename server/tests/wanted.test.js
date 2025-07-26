const request = require('supertest');
const createApp = require('../index');

// Mock axios to avoid actual API calls during tests
jest.mock('axios');
const axios = require('axios');

// Create app instance for testing
let app;

// Create a test JWT token
const jwt = require('jsonwebtoken');
const testToken = jwt.sign(
  { username: 'testuser', role: 'admin' },
  process.env.JWT_SECRET || 'your-secret-key',
  { expiresIn: '1h' }
);

const mockFBIResponse = {
  total: 100,
  page: 1,
  items: [
    {
      uid: '12345',
      title: 'John Doe',
      hair_raw: 'Brown',
      race_raw: 'White',
      description: 'Test description',
      images: [{ original: 'http://example.com/image.jpg' }]
    }
  ]
};

describe('FBI Wanted API Routes', () => {
  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/wanted', () => {
    it('should return wanted persons list', async () => {
      axios.get.mockResolvedValue({ data: mockFBIResponse });

      const response = await request(app)
        .get('/api/wanted')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(response.body.cached).toBe(false);
    });

    it('should handle pagination parameters', async () => {
      axios.get.mockResolvedValue({ data: mockFBIResponse });

      const response = await request(app)
        .get('/api/wanted?page=2&pageSize=10')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/list'),
        expect.objectContaining({
          params: { page: 2, pageSize: 10 }
        })
      );
    });

    it('should return cached data on second request', async () => {
      axios.get.mockResolvedValue({ data: mockFBIResponse });

      // First request
      await request(app).get('/api/wanted').set('Authorization', `Bearer ${testToken}`).expect(200);
      
      // Second request should be cached
      const response = await request(app).get('/api/wanted').set('Authorization', `Bearer ${testToken}`).expect(200);
      
      expect(response.body.cached).toBe(true);
      expect(response.body).toHaveProperty('cacheAge');
    });
  });

  describe('GET /api/wanted/search', () => {
    it('should search wanted persons', async () => {
      axios.get.mockResolvedValue({ data: mockFBIResponse });

      const response = await request(app)
        .get('/api/wanted/search?query=John')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body.searchQuery).toBe('John');
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/list'),
        expect.objectContaining({
          params: expect.objectContaining({ title: 'John' })
        })
      );
    });

    it('should return error for empty query', async () => {
      const response = await request(app)
        .get('/api/wanted/search?query=')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(400);

      expect(response.body.error.message).toBe('Search query is required');
    });

    it('should return error for missing query', async () => {
      const response = await request(app)
        .get('/api/wanted/search')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(400);

      expect(response.body.error.message).toBe('Search query is required');
    });
  });

  describe('GET /api/wanted/:id', () => {
    it('should return specific wanted person', async () => {
      const mockPersonResponse = {
        uid: '12345',
        title: 'John Doe',
        description: 'Detailed description'
      };
      
      axios.get.mockResolvedValue({ data: mockPersonResponse });

      const response = await request(app)
        .get('/api/wanted/12345')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('uid', '12345');
      expect(response.body).toHaveProperty('title', 'John Doe');
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/12345'),
        expect.any(Object)
      );
    });

    it('should return 404 for non-existent person', async () => {
      const error = new Error('Not found');
      error.response = { status: 404 };
      axios.get.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/wanted/nonexistent')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404);

      expect(response.body.error.message).toBe('Person not found');
    });
  });

  describe('GET /api/wanted/filters/options', () => {
    it('should return filter options', async () => {
      axios.get.mockResolvedValue({ data: mockFBIResponse });

      const response = await request(app)
        .get('/api/wanted/filters/options')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('hairColors');
      expect(response.body).toHaveProperty('races');
      expect(Array.isArray(response.body.hairColors)).toBe(true);
      expect(Array.isArray(response.body.races)).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle API timeout', async () => {
      // Clear cache to ensure fresh API call
      const cacheService = require('../services/cacheService');
      cacheService.clear();
      
      const error = new Error('Request timeout');
      error.code = 'ECONNABORTED';
      axios.get.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/wanted')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(500);

      expect(response.body.error.message).toBe('Request timeout. Please try again.');
    });

    it('should handle rate limiting', async () => {
      // Clear cache to ensure fresh API call
      const cacheService = require('../services/cacheService');
      cacheService.clear();
      
      const error = new Error('Rate limited');
      error.response = { status: 429 };
      axios.get.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/wanted')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(500);

      expect(response.body.error.message).toBe('Rate limit exceeded. Please try again later.');
    });
  });
});

describe('Health check', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('stats');
  });
});

describe('404 handler', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/unknown-route')
      .expect(404);

    expect(response.body.error.message).toBe('Route not found');
  });
});