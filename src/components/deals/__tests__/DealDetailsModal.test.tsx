
import React from 'react';
import { render, screen } from '@testing-library/react';
import DealDetailsModal from '../DealDetailsModal';
import { useDealNotes } from '../hooks/useDealNotes';
import { useDealStatus } from '../hooks/useDealStatus';

// Mock the hooks
jest.mock('../hooks/useDealNotes', () => ({
  useDealNotes: jest.fn(),
}));

jest.mock('../hooks/useDealStatus', () => ({
  useDealStatus: jest.fn(),
}));

describe('DealDetailsModal component', () => {
  const mockDeal = {
    id: '1',
    deal_name: 'Test Deal',
    company_name: 'Test Company',
    amount: 15000,
    status: 'open' as const,
    contact_first_name: 'John',
    contact_last_name: 'Doe',
    contact_email: 'john@example.com',
    start_date: '2023-01-15',
    expected_close_date: '2023-03-15',
    health_score: 75,
    next_action: 'Follow up call',
    user_id: 'user-123',
    notes: '',
    custom_fields: {},
  };
  
  const mockNotes = [
    { 
      id: '1', 
      content: 'Note 1', 
      created_at: '2023-01-01T12:00:00Z', 
      sentiment_score: 50,
      deal_id: '1',
      user_id: 'user-123',
    },
  ];
  
  const mockProps = {
    deal: mockDeal,
    onClose: jest.fn(),
    onDealUpdated: jest.fn(),
    customFields: [],
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    (useDealNotes as jest.Mock).mockReturnValue({
      notes: mockNotes,
      newNote: '',
      setNewNote: jest.fn(),
      isLoading: false,
      isAnalyzing: false,
      fetchNotes: jest.fn(),
      handleAddNote: jest.fn(),
    });
    
    (useDealStatus as jest.Mock).mockReturnValue({
      status: 'open',
      setStatus: jest.fn(),
      isStatusUpdating: false,
      handleStatusChange: jest.fn(),
    });
  });

  it('should render nothing when deal is null', () => {
    const { container } = render(<DealDetailsModal {...mockProps} deal={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render deal header with correct title', () => {
    render(<DealDetailsModal {...mockProps} />);
    expect(screen.getByText('Test Deal')).toBeInTheDocument();
  });

  it('should call the useDealNotes hook with correct parameters', () => {
    render(<DealDetailsModal {...mockProps} />);
    expect(useDealNotes).toHaveBeenCalledWith(mockDeal, mockProps.onDealUpdated);
  });

  it('should call the useDealStatus hook with correct parameters', () => {
    render(<DealDetailsModal {...mockProps} />);
    expect(useDealStatus).toHaveBeenCalledWith(mockDeal, mockProps.onDealUpdated);
  });

  it('should call fetchNotes and setStatus on initial render', () => {
    const mockFetchNotes = jest.fn();
    const mockSetStatus = jest.fn();
    
    (useDealNotes as jest.Mock).mockReturnValue({
      notes: [],
      newNote: '',
      setNewNote: jest.fn(),
      isLoading: false,
      isAnalyzing: false,
      fetchNotes: mockFetchNotes,
      handleAddNote: jest.fn(),
    });
    
    (useDealStatus as jest.Mock).mockReturnValue({
      status: 'open',
      setStatus: mockSetStatus,
      isStatusUpdating: false,
      handleStatusChange: jest.fn(),
    });
    
    render(<DealDetailsModal {...mockProps} />);
    
    expect(mockFetchNotes).toHaveBeenCalled();
    expect(mockSetStatus).toHaveBeenCalledWith('open');
  });

  it('should render DealInfoSection with deal data', () => {
    render(<DealDetailsModal {...mockProps} />);
    
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('$15,000.00')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render DealNotesSection with notes data', () => {
    render(<DealDetailsModal {...mockProps} />);
    
    expect(screen.getByText('Notes & Analysis')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add a note...')).toBeInTheDocument();
    expect(screen.getByText('Add Note')).toBeInTheDocument();
  });

  it('should have a descriptive aria-label for accessibility', () => {
    render(<DealDetailsModal {...mockProps} />);
    
    const descriptionElement = screen.getByText(/Deal details and history for Test Deal/);
    expect(descriptionElement).toHaveClass('sr-only');
  });
});
