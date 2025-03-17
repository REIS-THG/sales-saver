
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DealNotesSection } from '../DealNotesSection';
import { format } from 'date-fns';

jest.mock('date-fns', () => ({
  format: jest.fn().mockReturnValue('January 1, 2023 12:00 PM'),
}));

describe('DealNotesSection component', () => {
  const mockProps = {
    notes: [
      {
        id: '1',
        content: 'First note content',
        created_at: '2023-01-01T12:00:00Z',
        sentiment_score: 50,
        deal_id: 'deal-1',
        user_id: 'user-1',
        ai_analysis: {
          key_points: ['Point 1', 'Point 2'],
          next_actions: ['Action 1']
        }
      },
      {
        id: '2',
        content: 'Second note content',
        created_at: '2023-01-02T12:00:00Z',
        sentiment_score: -40,
        deal_id: 'deal-1',
        user_id: 'user-1',
        ai_analysis: null
      }
    ],
    newNote: '',
    isLoading: false,
    isAnalyzing: false,
    onNoteChange: jest.fn(),
    onAddNote: jest.fn(),
  };

  it('should render the notes header', () => {
    render(<DealNotesSection {...mockProps} />);
    expect(screen.getByText('Notes & Analysis')).toBeInTheDocument();
  });

  it('should render the textarea for new notes', () => {
    render(<DealNotesSection {...mockProps} />);
    expect(screen.getByPlaceholderText('Add a note...')).toBeInTheDocument();
  });

  it('should call onNoteChange when typing in the textarea', () => {
    render(<DealNotesSection {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText('Add a note...');
    fireEvent.change(textarea, { target: { value: 'New note content' } });
    
    expect(mockProps.onNoteChange).toHaveBeenCalledWith('New note content');
  });

  it('should disable Add Note button when isLoading is true', () => {
    render(<DealNotesSection {...mockProps} isLoading={true} newNote="Test" />);
    
    expect(screen.getByText('Add Note')).toBeDisabled();
  });

  it('should disable Add Note button when newNote is empty', () => {
    render(<DealNotesSection {...mockProps} newNote="" />);
    
    expect(screen.getByText('Add Note')).toBeDisabled();
  });

  it('should call onAddNote when Add Note button is clicked', () => {
    render(<DealNotesSection {...mockProps} newNote="Test note" />);
    
    fireEvent.click(screen.getByText('Add Note'));
    
    expect(mockProps.onAddNote).toHaveBeenCalled();
  });

  it('should render notes list with correct sentiment labels', () => {
    render(<DealNotesSection {...mockProps} />);
    
    expect(screen.getByText('First note content')).toBeInTheDocument();
    expect(screen.getByText('Second note content')).toBeInTheDocument();
    
    expect(screen.getByText('Positive (50)')).toBeInTheDocument();
    expect(screen.getByText('Negative (-40)')).toBeInTheDocument();
  });

  it('should render note timestamps', () => {
    render(<DealNotesSection {...mockProps} />);
    
    expect(format).toHaveBeenCalledWith(new Date('2023-01-01T12:00:00Z'), 'PPp');
    expect(format).toHaveBeenCalledWith(new Date('2023-01-02T12:00:00Z'), 'PPp');
    expect(screen.getAllByText('January 1, 2023 12:00 PM')).toHaveLength(2);
  });

  it('should render AI analysis for notes that have it', () => {
    render(<DealNotesSection {...mockProps} />);
    
    expect(screen.getByText('Point 1')).toBeInTheDocument();
    expect(screen.getByText('Point 2')).toBeInTheDocument();
    expect(screen.getByText('Action 1')).toBeInTheDocument();
  });

  it('should display spinner when analyzing', () => {
    render(<DealNotesSection {...mockProps} isAnalyzing={true} newNote="Test" />);
    
    // Check if spinner is rendered
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});
