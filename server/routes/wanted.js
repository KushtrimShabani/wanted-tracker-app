/**
 * routes/wanted.js
 * Express router for FBI Wanted endpoints
 *
 * Usage:
 *   const wantedRouter = require('./routes/wanted');
 *   app.use('/api/wanted', wantedRouter);
 */

const express  = require('express');
const axios    = require('axios');
const cacheService = require('../services/cacheService');

const router = express.Router();

// All FBI calls go through the same host
const FBI_API_HOST = 'https://api.fbi.gov';

// Axios wrapper
async function makeFBIRequest(path, params = {}) {
  try {
    const url = `${FBI_API_HOST}${path}`;
    const { data } = await axios.get(url, {
      params,
      timeout: 10_000,
      headers: { 'User-Agent': 'FBI-Wanted-Directory-App/1.0' }
    });
    return data;
  } catch (error) {
    console.error('FBI API Error:', error.message);

    if (error.response?.status === 429) {
      const rateLimitError = new Error('Rate limit exceeded. Please try again later.');
      rateLimitError.status = 429;
      throw rateLimitError;
    }
    if (error.response?.status === 404) {
      // Preserve 404 errors for route handlers to catch
      throw error;
    }
    if (error.code === 'ECONNABORTED') {
      const timeoutError = new Error('Request timeout. Please try again.');
      timeoutError.status = 408;
      throw timeoutError;
    }
    throw new Error('Failed to fetch data from FBI API');
  }
}

router.get('/', async (req, res, next) => {
  try {
    const page     = parseInt(req.query.page     , 10) || 1;
    const pageSize = parseInt(req.query.pageSize , 10) || 20;

    const cacheKey   = `wanted_list_${page}_${pageSize}`;
    const cachedData = cacheService.get(cacheKey, 'list');
    if (cachedData) {
      return res.json(cachedData);
    }

    const data = await makeFBIRequest('/wanted/v1/list', { page, pageSize });
    const payload = cacheService.set(cacheKey, data, 'list');
    res.json(payload);
  } catch (error) {
    if (error.status === 429) {
      return res.status(500).json({
        error: { message: error.message, status: 500 }
      });
    }
    if (error.status === 408) {
      return res.status(500).json({
        error: { message: error.message, status: 500 }
      });
    }
    next(error);
  }
});

router.get('/filters/options', async (req, res, next) => {
  try {
    const cacheKey = 'wanted_filter_options';
    const cached   = cacheService.get(cacheKey, 'filter');
    if (cached) return res.json(cached);

    const sample = await makeFBIRequest('/wanted/v1/list', { pageSize: 100 });

    const hairColors = new Set();
    const races      = new Set();

    sample.items?.forEach(p => {
      if (p.hair_raw)  hairColors.add(p.hair_raw);
      if (p.race_raw)  races.add(p.race_raw);
    });

    const options = {
      hairColors: Array.from(hairColors).sort(),
      races     : Array.from(races).sort()
    };

    cacheService.set(cacheKey, options, 'filter');
    res.json(options);
  } catch (err) { next(err); }
});

router.get('/search', async (req, res, next) => {
  try {
    const { query, page = 1, pageSize = 20 } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        error: { message: 'Search query is required', status: 400 }
      });
    }

    const cacheKey = `wanted_search_${query}_${page}_${pageSize}`;
    const cached   = cacheService.get(cacheKey, 'search');
    if (cached) {
      return res.json(cached);
    }

    const data = await makeFBIRequest('/wanted/v1/list', {
      title: query,
      page,
      pageSize
    });

    const payload = cacheService.set(cacheKey, { ...data, searchQuery: query }, 'search');
    res.json(payload);
  } catch (err) { next(err); }
});


router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // quick sanity check (24‑char hex)
    // if (!/^[a-f0-9]{24}$/i.test(id)) {
    //   return res.status(400).json({
    //     error: { message: 'Invalid UID format', status: 400 }
    //   });
    // }

    const cacheKey   = `wanted_person_${id}`;
    const cachedData = cacheService.get(cacheKey, 'detail');
    if (cachedData) {
      return res.json(cachedData);
    }

    // Detail endpoint lives outside /wanted/v1
    const data = await makeFBIRequest(`/@wanted-person/${id}`);

    const payload = cacheService.set(cacheKey, data, 'detail');
    res.json(payload);

  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: { message: 'Person not found', status: 404 }
      });
    }
    next(error);
  }
});

module.exports = router;
