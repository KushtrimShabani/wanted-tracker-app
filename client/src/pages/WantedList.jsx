import React, { useEffect, useCallback, useRef } from 'react';
import { useWantedStore } from '../store/wantedStore';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import WantedCard from '../components/WantedCard';
import LoadingSpinner from '../components/LoadingSpinner';

const WantedList = () => {
  const {
    wantedList,
    filteredList,
    isLoading,
    error,
    hasMore,
    currentPage,
    isSearching,
    searchQuery,
    filters,
    fetchWanted,
    loadMore,
    setToast
  } = useWantedStore();

  const loadMoreRef = useRef();

  useEffect(() => {
    if (wantedList.length === 0) {
      fetchWanted();
    }
  }, [fetchWanted, wantedList.length]);

  useEffect(() => {
    if (error) {
      setToast({ type: 'error', message: error });
    }
  }, [error, setToast]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadMore();
    }
  }, [isLoading, hasMore, loadMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [handleLoadMore]);

  const displayList = isSearching ? filteredList : wantedList;
  const hasActiveFilters = filters.hairColor || filters.race;

  // Apply client-side filtering
  const finalList = hasActiveFilters
    ? displayList.filter(person => {
        return (!filters.hairColor || person.hair_raw === filters.hairColor) &&
               (!filters.race || person.race_raw === filters.race);
      })
    : displayList;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          FBI Most Wanted
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Search through the FBI's most wanted list. Help law enforcement by reporting any information.
        </p>
      </div>

      <SearchBar />
      <FilterPanel />

      {isSearching && searchQuery && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Search results for "{searchQuery}"
            {finalList.length > 0 && (
              <span className="text-gray-600 font-normal ml-2">
                ({finalList.length} {finalList.length === 1 ? 'result' : 'results'})
              </span>
            )}
          </h2>
        </div>
      )}

      {hasActiveFilters && (
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {finalList.length} {finalList.length === 1 ? 'result' : 'results'} with active filters
          </p>
        </div>
      )}

      {finalList.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isSearching ? 'No results found' : 'No wanted persons found'}
          </h3>
          <p className="text-gray-600">
            {isSearching 
              ? 'Try adjusting your search terms or filters'
              : 'Please try again later'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {finalList.map((person, index) => (
              <WantedCard key={`${person.uid}-${index}`} person={person} />
            ))}
          </div>

          {!isSearching && hasMore && (
            <div ref={loadMoreRef} className="mt-8">
              {isLoading ? (
                <LoadingSpinner text="Loading more..." />
              ) : (
                <div className="text-center">
                  <button
                    onClick={handleLoadMore}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          )}

          {isLoading && finalList.length === 0 && (
            <LoadingSpinner text="Loading wanted persons..." />
          )}
        </>
      )}
    </div>
  );
};

export default WantedList;