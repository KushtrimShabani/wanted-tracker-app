import { create } from 'zustand';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const useWantedStore = create((set, get) => ({
  // State
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
  filters: {
    hairColor: '',
    race: ''
  },
  filterOptions: {
    hairColors: [],
    races: []
  },

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: null }),
  clearError: () => set({ error: null }),

  // Fetch wanted list
  fetchWanted: async (page = 1) => {
    const { setLoading, setError } = get();
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/wanted?page=${page}&pageSize=20`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Clear invalid token and redirect to login
          localStorage.removeItem('jwt_token');
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      set((state) => ({
        wantedList: page === 1 ? data.items : [...state.wantedList, ...data.items],
        currentPage: page,
        hasMore: data.items.length === 20 && data.total > state.wantedList.length + data.items.length,
        isLoading: false
      }));
    } catch (error) {
      console.error('Fetch wanted error:', error);
      setError('Failed to load wanted persons. Please try again.');
      setLoading(false);
    }
  },

  // Load more (pagination)
  loadMore: async () => {
    const { currentPage, fetchWanted } = get();
    await fetchWanted(currentPage + 1);
  },

  // Search wanted persons
  searchWanted: async (query) => {
    const { setLoading, setError } = get();
    
    if (!query.trim()) {
      set({ isSearching: false, searchQuery: '', filteredList: [] });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/wanted/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Clear invalid token and redirect to login
          localStorage.removeItem('jwt_token');
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      set({
        filteredList: data.items || [],
        searchQuery: query,
        isSearching: true,
        isLoading: false
      });
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search. Please try again.');
      setLoading(false);
    }
  },

  // Clear search
  clearSearch: () => {
    set({
      isSearching: false,
      searchQuery: '',
      filteredList: []
    });
  },

  // Fetch single wanted person
  fetchWantedPerson: async (id) => {
    const { setLoading, setError } = get();
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/wanted/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Clear invalid token and redirect to login
          localStorage.removeItem('jwt_token');
          window.location.href = '/login';
          return;
        }
        if (response.status === 404) {
          throw new Error('Person not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      set({
        currentPerson: data,
        isLoading: false
      });
    } catch (error) {
      console.error('Fetch person error:', error);
      setError(error.message || 'Failed to load person details. Please try again.');
      setLoading(false);
    }
  },

  // Clear current person
  clearCurrentPerson: () => set({ currentPerson: null }),

  // Fetch filter options
  fetchFilterOptions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wanted/filters/options`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Clear invalid token and redirect to login
          localStorage.removeItem('jwt_token');
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      set({
        filterOptions: {
          hairColors: data.hairColors || [],
          races: data.races || []
        }
      });
    } catch (error) {
      console.error('Fetch filter options error:', error);
      // Don't show error for filter options as it's not critical
    }
  },

  // Set filter
  setFilter: (filterType, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [filterType]: value
      }
    }));
  },

  // Clear all filters
  clearFilters: () => {
    set({
      filters: {
        hairColor: '',
        race: ''
      }
    });
  }
}));

export { useWantedStore };