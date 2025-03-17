
import React from 'react';
import { render, screen } from '@testing-library/react';
import { DealInfoSection } from '../DealInfoSection';

describe('DealInfoSection component', () => {
  const mockDeal = {
    id: '1',
    deal_name: 'Test Deal',
    company_name: 'Test Company',
    amount: 15000,
    status: 'open' as const,
    health_score: 75,
    user_id: 'user-123',
    contact_first_name: 'John',
    contact_last_name: 'Doe',
    contact_email: 'john.doe@example.com',
    start_date: '2023-01-15',
    expected_close_date: '2023-03-15',
    next_action: 'Follow up call',
    notes: '',
    custom_fields: {},
  };

  it('should render company information correctly', () => {
    render(<DealInfoSection deal={mockDeal} />);
    
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Test Company')).toBeInTheDocument();
  });

  it('should format amount as currency', () => {
    render(<DealInfoSection deal={mockDeal} />);
    
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('$15,000.00')).toBeInTheDocument();
  });

  it('should display contact information', () => {
    render(<DealInfoSection deal={mockDeal} />);
    
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    render(<DealInfoSection deal={mockDeal} />);
    
    expect(screen.getByText('Dates')).toBeInTheDocument();
    
    // The actual formatted date will depend on the browser's locale,
    // so we check for parts of the text content instead
    const startDateText = screen.getByText(/Start:/);
    expect(startDateText).toBeInTheDocument();
    
    const expectedCloseText = screen.getByText(/Expected Close:/);
    expect(expectedCloseText).toBeInTheDocument();
  });

  it('should display next action if available', () => {
    render(<DealInfoSection deal={mockDeal} />);
    
    expect(screen.getByText('Next Action')).toBeInTheDocument();
    expect(screen.getByText('Follow up call')).toBeInTheDocument();
  });

  it('should handle missing dates correctly', () => {
    const dealWithoutDates = {
      ...mockDeal,
      start_date: null,
      expected_close_date: null,
    };
    
    render(<DealInfoSection deal={dealWithoutDates} />);
    
    expect(screen.getByText(/Start: N\/A/)).toBeInTheDocument();
    expect(screen.queryByText(/Expected Close:/)).not.toBeInTheDocument();
  });

  it('should not display next action section if not available', () => {
    const dealWithoutNextAction = {
      ...mockDeal,
      next_action: null,
    };
    
    render(<DealInfoSection deal={dealWithoutNextAction} />);
    
    expect(screen.queryByText('Next Action')).not.toBeInTheDocument();
  });
});
