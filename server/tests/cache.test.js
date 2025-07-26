/**
 * tests/cache.test.js
 * Tests for cache service functionality
 */

const cacheService = require('../services/cacheService');

describe('Cache Service', () => {
  beforeEach(() => {
    // Clear all caches before each test
    cacheService.clear();
  });

  test('should set and get data from list cache', () => {
    const testData = { items: [], total: 0 };
    const key = 'test_list_key';
    
    // Set data
    const setResult = cacheService.set(key, testData, 'list');
    expect(setResult.cached).toBe(false);
    expect(setResult.cacheTimestamp).toBeDefined();
    
    // Get data
    const getResult = cacheService.get(key, 'list');
    expect(getResult).toBeDefined();
    expect(getResult.cached).toBe(true);
    expect(getResult.cacheAge).toBeDefined();
    expect(getResult.cacheType).toBe('list');
  });

  test('should handle different cache types', () => {
    const testData = { name: 'test' };
    const key = 'test_key';
    
    // Test detail cache
    cacheService.set(key, testData, 'detail');
    const detailResult = cacheService.get(key, 'detail');
    expect(detailResult.cacheType).toBe('detail');
    
    // Test filter cache
    cacheService.set(key, testData, 'filter');
    const filterResult = cacheService.get(key, 'filter');
    expect(filterResult.cacheType).toBe('filter');
    
    // Test search cache
    cacheService.set(key, testData, 'search');
    const searchResult = cacheService.get(key, 'search');
    expect(searchResult.cacheType).toBe('search');
  });

  test('should return null for non-existent keys', () => {
    const result = cacheService.get('non_existent_key', 'list');
    expect(result).toBeNull();
  });

  test('should track statistics', () => {
    const stats = cacheService.getStats();
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(0);
    expect(stats.sets).toBe(0);
    expect(stats.deletes).toBe(0);
    expect(stats.hitRate).toBe(0);
    
    // Set some data
    cacheService.set('test1', { data: 'test' }, 'list');
    cacheService.set('test2', { data: 'test' }, 'detail');
    
    // Get some data
    cacheService.get('test1', 'list'); // hit
    cacheService.get('test2', 'detail'); // hit
    cacheService.get('non_existent', 'list'); // miss
    
    const newStats = cacheService.getStats();
    expect(newStats.sets).toBe(2);
    expect(newStats.hits).toBe(2);
    expect(newStats.misses).toBe(1);
    expect(newStats.hitRate).toBe(67); // 2 hits out of 3 total requests
  });

  test('should clear all caches', () => {
    // Set data in different caches
    cacheService.set('key1', { data: 'test1' }, 'list');
    cacheService.set('key2', { data: 'test2' }, 'detail');
    cacheService.set('key3', { data: 'test3' }, 'filter');
    cacheService.set('key4', { data: 'test4' }, 'search');
    
    // Verify data exists
    expect(cacheService.get('key1', 'list')).toBeDefined();
    expect(cacheService.get('key2', 'detail')).toBeDefined();
    expect(cacheService.get('key3', 'filter')).toBeDefined();
    expect(cacheService.get('key4', 'search')).toBeDefined();
    
      // Clear all caches
  cacheService.clear();
  
  // Verify stats are reset FIRST (before any get operations)
  const stats = cacheService.getStats();
  expect(stats.hits).toBe(0);
  expect(stats.misses).toBe(0);
  expect(stats.sets).toBe(0);
  expect(stats.deletes).toBe(0);
  
  // Verify all data is cleared
  expect(cacheService.get('key1', 'list')).toBeNull();
  expect(cacheService.get('key2', 'detail')).toBeNull();
  expect(cacheService.get('key3', 'filter')).toBeNull();
  expect(cacheService.get('key4', 'search')).toBeNull();
  });

  test('should provide cache sizes in stats', () => {
    cacheService.set('key1', { data: 'test1' }, 'list');
    cacheService.set('key2', { data: 'test2' }, 'detail');
    cacheService.set('key3', { data: 'test3' }, 'filter');
    cacheService.set('key4', { data: 'test4' }, 'search');
    
    const stats = cacheService.getStats();
    expect(stats.cacheSizes.list).toBe(1);
    expect(stats.cacheSizes.detail).toBe(1);
    expect(stats.cacheSizes.filter).toBe(1);
    expect(stats.cacheSizes.search).toBe(1);
    expect(stats.totalKeys).toBe(4);
  });
}); 