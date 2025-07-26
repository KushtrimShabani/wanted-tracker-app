import { useWantedStore } from '../../store/wantedStore';
import { vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

beforeEach(() => {
  fetch.mockClear();
  useWantedStore.setState({
    wantedList: [],
    filteredList: [],
    currentPerson: null,
    isLoading: false,
    error: null,
    toast: null,
    currentPage: 1,
    hasMore: true,
    searchQuery: '',
    isSearching: false,
    filters: { hairColor: '', race: '' },
    filterOptions: { hairColors: [], races: [] }
  });
});

describe('wantedStore', () => {
  describe('fetchWanted', () => {
    it('should fetch wanted list successfully', async () => {
      const mockData = {
        items: [
          { uid: '1', title: 'John Doe' },
          { uid: '2', title: 'Jane Smith' }
        ],
        total: 100
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const { fetchWanted } = useWantedStore.getState();
      await fetchWanted();

      const state = useWantedStore.getState();
      expect(state.wantedList).toEqual(mockData.items);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle fetch error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const { fetchWanted } = useWantedStore.getState();
      await fetchWanted();

      const state = useWantedStore.getState();
      expect(state.error).toBe('Failed to load wanted persons. Please try again.');
      expect(state.isLoading).toBe(false);
    });

    it('should append items when loading more pages', async () => {
      // Set initial state
      useWantedStore.setState({
        wantedList: [{ uid: '1', title: 'John Doe' }],
        currentPage: 1
      });

      const mockData = {
        items: [{ uid: '2', title: 'Jane Smith' }],
        total: 100
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const { fetchWanted } = useWantedStore.getState();
      await fetchWanted(2);

      const state = useWantedStore.getState();
      expect(state.wantedList).toHaveLength(2);
      expect(state.wantedList[1].title).toBe('Jane Smith');
      expect(state.currentPage).toBe(2);
    });
  });

  describe('searchWanted', () => {
    it('should search wanted persons successfully', async () => {
      const mockData = {
        items: [{ uid: '1', title: 'Search Result' }]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const { searchWanted } = useWantedStore.getState();
      await searchWanted('test query');

      const state = useWantedStore.getState();
      expect(state.filteredList).toEqual(mockData.items);
      expect(state.isSearching).toBe(true);
      expect(state.searchQuery).toBe('test query');
    });

    it('should clear search for empty query', async () => {
      useWantedStore.setState({
        isSearching: true,
        searchQuery: 'old query',
        filteredList: [{ uid: '1', title: 'Result' }]
      });

      const { searchWanted } = useWantedStore.getState();
      await searchWanted('');

      const state = useWantedStore.getState();
      expect(state.isSearching).toBe(false);
      expect(state.searchQuery).toBe('');
      expect(state.filteredList).toEqual([]);
    });
  });

  describe('fetchWantedPerson', () => {
    it('should fetch person details successfully', async () => {
      const mockPerson = {
        uid: '12345',
        title: 'John Doe',
        description: 'Test description'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPerson
      });

      const { fetchWantedPerson } = useWantedStore.getState();
      await fetchWantedPerson('12345');

      const state = useWantedStore.getState();
      expect(state.currentPerson).toEqual(mockPerson);
      expect(state.isLoading).toBe(false);
    });

    it('should handle 404 error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const { fetchWantedPerson } = useWantedStore.getState();
      await fetchWantedPerson('nonexistent');

      const state = useWantedStore.getState();
      expect(state.error).toBe('Person not found');
      expect(state.currentPerson).toBe(null);
    });
  });

  describe('filters', () => {
    it('should set filter correctly', () => {
      const { setFilter } = useWantedStore.getState();
      setFilter('hairColor', 'Brown');

      const state = useWantedStore.getState();
      expect(state.filters.hairColor).toBe('Brown');
    });

    it('should clear all filters', () => {
      useWantedStore.setState({
        filters: { hairColor: 'Brown', race: 'White' }
      });

      const { clearFilters } = useWantedStore.getState();
      clearFilters();

      const state = useWantedStore.getState();
      expect(state.filters).toEqual({ hairColor: '', race: '' });
    });
  });

  describe('fetchFilterOptions', () => {
    it('should fetch filter options successfully', async () => {
      const mockOptions = {
        hairColors: ['Brown', 'Black', 'Blonde'],
        races: ['White', 'Black', 'Hispanic']
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOptions
      });

      const { fetchFilterOptions } = useWantedStore.getState();
      await fetchFilterOptions();

      const state = useWantedStore.getState();
      expect(state.filterOptions).toEqual(mockOptions);
    });

    it('should handle fetch error silently', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const { fetchFilterOptions } = useWantedStore.getState();
      await fetchFilterOptions();

      const state = useWantedStore.getState();
      // Should not set error for filter options
      expect(state.error).toBe(null);
    });
  });
});