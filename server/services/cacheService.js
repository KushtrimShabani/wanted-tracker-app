/**
 * services/cacheService.js
 * Enhanced caching service for FBI Wanted API
 */

const NodeCache = require('node-cache');
const axios = require('axios');

class CacheService {
  constructor() {
    // Different cache instances for different data types
    this.listCache = new NodeCache({ 
      stdTTL: 300, // 5 minutes for list data
      checkperiod: 60, // Check for expired keys every minute
      useClones: false // Better performance
    });
    
    this.detailCache = new NodeCache({ 
      stdTTL: 1800, // 30 minutes for detail data
      checkperiod: 120,
      useClones: false
    });
    
    this.filterCache = new NodeCache({ 
      stdTTL: 3600, // 1 hour for filter options
      checkperiod: 300,
      useClones: false
    });
    
    this.searchCache = new NodeCache({ 
      stdTTL: 600, // 10 minutes for search results
      checkperiod: 60,
      useClones: false
    });

    // Cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };

    // Set up event listeners for statistics
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Track cache hits and misses
    this.listCache.on('hit', () => this.stats.hits++);
    this.listCache.on('miss', () => this.stats.misses++);
    this.detailCache.on('hit', () => this.stats.hits++);
    this.detailCache.on('miss', () => this.stats.misses++);
    this.filterCache.on('hit', () => this.stats.hits++);
    this.filterCache.on('miss', () => this.stats.misses++);
    this.searchCache.on('hit', () => this.stats.hits++);
    this.searchCache.on('miss', () => this.stats.misses++);
  }

  // Get data from appropriate cache
  get(key, cacheType = 'list') {
    const cache = this.getCache(cacheType);
    const data = cache.get(key);
    
    if (data) {
      this.stats.hits++;
      return {
        ...data,
        cached: true,
        cacheAge: Math.floor((Date.now() - data.cacheTimestamp) / 1000),
        cacheType
      };
    }
    
    this.stats.misses++;
    return null;
  }

  // Set data in appropriate cache
  set(key, data, cacheType = 'list', ttl = null) {
    const cache = this.getCache(cacheType);
    const payload = {
      ...data,
      cacheTimestamp: Date.now(),
      cached: false
    };
    
    if (ttl) {
      cache.set(key, payload, ttl);
    } else {
      cache.set(key, payload);
    }
    
    this.stats.sets++;
    return payload;
  }

  // Delete from specific cache
  delete(key, cacheType = 'list') {
    const cache = this.getCache(cacheType);
    const deleted = cache.del(key);
    if (deleted) this.stats.deletes++;
    return deleted;
  }

  // Clear all caches
  clear() {
    this.listCache.flushAll();
    this.detailCache.flushAll();
    this.filterCache.flushAll();
    this.searchCache.flushAll();
    this.resetStats();
    return true;
  }

  // Get cache statistics
  getStats() {
    return {
      ...this.stats,
      hitRate: this.stats.hits + this.stats.misses > 0 
        ? Math.round((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100) 
        : 0,
      cacheSizes: {
        list: this.listCache.keys().length,
        detail: this.detailCache.keys().length,
        filter: this.filterCache.keys().length,
        search: this.searchCache.keys().length
      },
      totalKeys: this.listCache.keys().length + 
                 this.detailCache.keys().length + 
                 this.filterCache.keys().length + 
                 this.searchCache.keys().length
    };
  }

  // Reset statistics
  resetStats() {
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  // Get appropriate cache instance
  getCache(cacheType) {
    switch (cacheType) {
      case 'detail':
        return this.detailCache;
      case 'filter':
        return this.filterCache;
      case 'search':
        return this.searchCache;
      default:
        return this.listCache;
    }
  }

  // Warm up cache with popular data
  async warmup() {
    console.log('🔄 Warming up cache...');
    
    // Pre-fetch first page of wanted list
    try {
      const data = await axios.get('https://api.fbi.gov/wanted/v1/list', {
        params: { page: 1, pageSize: 20 },
        timeout: 10000
      });
      
      this.set('wanted_list_1_20', data.data, 'list');
      console.log('✅ Cache warmup completed');
    } catch (error) {
      console.log('⚠️ Cache warmup failed:', error.message);
    }
  }

  // Get cache keys for debugging
  getKeys(cacheType = 'list') {
    const cache = this.getCache(cacheType);
    return cache.keys();
  }
}

// Export singleton instance
module.exports = new CacheService(); 