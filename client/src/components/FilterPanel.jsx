import React, { useEffect } from 'react';
import { useWantedStore } from '../store/wantedStore';

const FilterPanel = () => {
  const { 
    filters, 
    filterOptions, 
    setFilter, 
    clearFilters, 
    fetchFilterOptions,
    isLoading 
  } = useWantedStore();

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  const handleFilterChange = (filterType, value) => {
    setFilter(filterType, value === 'all' ? '' : value);
  };

  const hasActiveFilters = filters.hairColor || filters.race;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hair Color Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hair Color
          </label>
          <select
            value={filters.hairColor || 'all'}
            onChange={(e) => handleFilterChange('hairColor', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900"
            disabled={isLoading}
          >
            <option value="all">All Hair Colors</option>
            {filterOptions.hairColors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        {/* Race Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Race
          </label>
          <select
            value={filters.race || 'all'}
            onChange={(e) => handleFilterChange('race', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900"
            disabled={isLoading}
          >
            <option value="all">All Races</option>
            {filterOptions.races.map((race) => (
              <option key={race} value={race}>
                {race}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.hairColor && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              Hair: {filters.hairColor}
              <button
                onClick={() => setFilter('hairColor', '')}
                className="ml-1 text-primary-600 hover:text-primary-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.race && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              Race: {filters.race}
              <button
                onClick={() => setFilter('race', '')}
                className="ml-1 text-primary-600 hover:text-primary-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;