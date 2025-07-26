import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SearchBar from '../../components/SearchBar';
import { useWantedStore } from '../../store/wantedStore';

import { vi } from 'vitest';

// Mock the store
vi.mock('../../store/wantedStore');

// Mock the debounce utility to avoid cross-test contamination
vi.mock('../../utils/debounce', () => ({
  debounce: vi.fn((fn) => fn) // Return the function immediately without debouncing
}));

const mockSearchWanted = vi.fn();
const mockClearSearch = vi.fn();

beforeEach(() => {
  // Clear all mocks first
  vi.clearAllMocks();
  
  // Reset mock functions explicitly
  mockSearchWanted.mockClear();
  mockClearSearch.mockClear();
  
  useWantedStore.mockReturnValue({
    searchWanted: mockSearchWanted,
    clearSearch: mockClearSearch,
    isLoading: false
  });
});

describe('SearchBar', () => {
  it('renders search input correctly', () => {
    render(<SearchBar />);
    
    expect(screen.getByPlaceholderText('Search wanted persons...')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('calls searchWanted with input', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'John Doe');
    
    // With mocked debounce, this executes immediately
    expect(mockSearchWanted).toHaveBeenCalledWith('John Doe');
  });

  it('calls clearSearch when input is cleared', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'John');
    await user.clear(input);
    
    await waitFor(() => {
      expect(mockClearSearch).toHaveBeenCalled();
    }, { timeout: 500 });
  });

  it('shows clear button when there is input', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'John');
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('clears input when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'John');
    
    const clearButton = screen.getByRole('button');
    await user.click(clearButton);
    
    expect(input).toHaveValue('');
    expect(mockClearSearch).toHaveBeenCalled();
  });

  it('shows loading state when isLoading is true', () => {
    useWantedStore.mockReturnValue({
      searchWanted: mockSearchWanted,
      clearSearch: mockClearSearch,
      isLoading: true
    });
    
    render(<SearchBar />);
    
    expect(screen.getByText('Searching...')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('calls clearSearch for whitespace-only input', async () => {
    // Ensure clean state
    mockSearchWanted.mockClear();
    mockClearSearch.mockClear();
    
    const user = userEvent.setup();
    render(<SearchBar />);
    
    const input = screen.getByRole('textbox');
    
    // Type only whitespace (debounce is mocked to execute immediately)
    await user.type(input, '   ');
    
    // Since debounce is mocked to execute immediately, verify behavior
    expect(mockClearSearch).toHaveBeenCalledTimes(3); // Called for each space character
    expect(mockSearchWanted).not.toHaveBeenCalled();
  });
});