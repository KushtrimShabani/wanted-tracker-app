import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import WantedList from '../../pages/WantedList';
import { useWantedStore } from '../../store/wantedStore';

import { vi } from 'vitest';

// Mock the store
vi.mock('../../store/wantedStore');

// Mock components
vi.mock('../../components/SearchBar', () => ({
  default: function MockSearchBar() {
    return <div data-testid="search-bar">Search Bar</div>;
  }
}));

vi.mock('../../components/FilterPanel', () => ({
  default: function MockFilterPanel() {
    return <div data-testid="filter-panel">Filter Panel</div>;
  }
}));

vi.mock('../../components/WantedCard', () => ({
  default: function MockWantedCard({ person }) {
    return <div data-testid={`wanted-card-${person.uid}`}>{person.title}</div>;
  }
}));

const mockFetchWanted = vi.fn();
const mockLoadMore = vi.fn();
const mockSetToast = vi.fn();

const defaultStoreState = {
  wantedList: [],
  filteredList: [],
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,
  isSearching: false,
  searchQuery: '',
  filters: {},
  fetchWanted: mockFetchWanted,
  loadMore: mockLoadMore,
  setToast: mockSetToast
};

const WantedListWrapper = () => (
  <BrowserRouter>
    <WantedList />
  </BrowserRouter>
);

beforeEach(() => {
      vi.clearAllMocks();
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    disconnect: vi.fn()
  }));
});

describe('WantedList', () => {
  it('renders main components', () => {
    useWantedStore.mockReturnValue(defaultStoreState);
    
    render(<WantedListWrapper />);
    
    expect(screen.getByText('FBI Most Wanted')).toBeInTheDocument();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
  });

  it('fetches wanted list on mount when list is empty', () => {
    useWantedStore.mockReturnValue(defaultStoreState);
    
    render(<WantedListWrapper />);
    
    expect(mockFetchWanted).toHaveBeenCalled();
  });

  it('does not fetch wanted list if list already has data', () => {
    useWantedStore.mockReturnValue({
      ...defaultStoreState,
      wantedList: [{ uid: '1', title: 'John Doe' }]
    });
    
    render(<WantedListWrapper />);
    
    expect(mockFetchWanted).not.toHaveBeenCalled();
  });

  it('displays wanted cards when data is available', () => {
    const mockData = [
      { uid: '1', title: 'John Doe' },
      { uid: '2', title: 'Jane Smith' }
    ];
    
    useWantedStore.mockReturnValue({
      ...defaultStoreState,
      wantedList: mockData
    });
    
    render(<WantedListWrapper />);
    
    expect(screen.getByTestId('wanted-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('wanted-card-2')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('shows search results when searching', () => {
    const searchResults = [{ uid: '3', title: 'Search Result' }];
    
    useWantedStore.mockReturnValue({
      ...defaultStoreState,
      isSearching: true,
      searchQuery: 'test query',
      filteredList: searchResults
    });
    
    render(<WantedListWrapper />);
    
    expect(screen.getByText('Search results for "test query"')).toBeInTheDocument();
    expect(screen.getByTestId('wanted-card-3')).toBeInTheDocument();
  });

  it('shows no results message when search returns empty', () => {
    useWantedStore.mockReturnValue({
      ...defaultStoreState,
      isSearching: true,
      searchQuery: 'no results',
      filteredList: []
    });
    
    render(<WantedListWrapper />);
    
    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search terms or filters')).toBeInTheDocument();
  });

  it('shows load more button when hasMore is true', () => {
    useWantedStore.mockReturnValue({
      ...defaultStoreState,
      wantedList: [{ uid: '1', title: 'John Doe' }],
      hasMore: true
    });
    
    render(<WantedListWrapper />);
    
    expect(screen.getByText('Load More')).toBeInTheDocument();
  });

  it('does not show load more button when searching', () => {
    useWantedStore.mockReturnValue({
      ...defaultStoreState,
      isSearching: true,
      filteredList: [{ uid: '1', title: 'John Doe' }],
      hasMore: true
    });
    
    render(<WantedListWrapper />);
    
    expect(screen.queryByText('Load More')).not.toBeInTheDocument();
  });

  it('shows toast when error occurs', async () => {
    useWantedStore.mockReturnValue({
      ...defaultStoreState,
      error: 'Test error message'
    });
    
    render(<WantedListWrapper />);
    
    await waitFor(() => {
      expect(mockSetToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'Test error message'
      });
    });
  });
});