import React, { useState, useCallback } from 'react';
import { useWantedStore } from '../store/wantedStore';
import { debounce } from '../utils/debounce';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const { searchWanted, clearSearch, isLoading } = useWantedStore();

  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      if (searchQuery.trim()) {
        searchWanted(searchQuery);
      } else {
        clearSearch();
      }
    }, 300),
    [searchWanted, clearSearch]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    clearSearch();
  };

  return (
    <div className="relative w-full max-w-xl mx-auto mb-8">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search wanted persons..."
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm text-gray-900 placeholder-gray-500"
          disabled={isLoading}
        />
        
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1">
          <div className="bg-white border border-gray-200 rounded-md p-2 shadow-sm">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="animate-spin w-4 h-4 border-2 border-primary-500 border-r-transparent rounded-full"></div>
              <span>Searching...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;