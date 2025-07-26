import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import WantedCard from '../../components/WantedCard';

const mockPerson = {
  uid: '12345',
  title: 'John Doe',
  hair_raw: 'Brown',
  race_raw: 'White',
  sex: 'Male',
  description: 'Test description for the wanted person',
  images: [
    { original: 'http://example.com/image.jpg' }
  ]
};

const WantedCardWrapper = ({ person }) => (
  <BrowserRouter>
    <WantedCard person={person} />
  </BrowserRouter>
);

describe('WantedCard', () => {
  it('renders person information correctly', () => {
    render(<WantedCardWrapper person={mockPerson} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Hair:')).toBeInTheDocument();
    expect(screen.getByText('Brown')).toBeInTheDocument();
    expect(screen.getByText('Race:')).toBeInTheDocument();
    expect(screen.getByText('White')).toBeInTheDocument();
    expect(screen.getByText('Sex:')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('Test description for the wanted person')).toBeInTheDocument();
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('renders image when available', () => {
    render(<WantedCardWrapper person={mockPerson} />);
    
    const image = screen.getByAltText('John Doe');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'http://example.com/image.jpg');
  });

  it('shows placeholder when no image available', () => {
    const personWithoutImage = { ...mockPerson, images: [] };
    render(<WantedCardWrapper person={personWithoutImage} />);
    
    expect(screen.getByText('No Image')).toBeInTheDocument();
  });

  it('handles unknown name', () => {
    const personWithoutName = { ...mockPerson, title: null };
    render(<WantedCardWrapper person={personWithoutName} />);
    
    expect(screen.getByText('Unknown Name')).toBeInTheDocument();
  });

  it('creates correct link to detail page', () => {
    render(<WantedCardWrapper person={mockPerson} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/wanted/12345');
  });

  it('handles missing optional fields gracefully', () => {
    const minimalPerson = {
      uid: '12345',
      title: 'Jane Doe'
    };
    
    render(<WantedCardWrapper person={minimalPerson} />);
    
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.queryByText('Hair:')).not.toBeInTheDocument();
    expect(screen.queryByText('Race:')).not.toBeInTheDocument();
    expect(screen.queryByText('Sex:')).not.toBeInTheDocument();
  });
});