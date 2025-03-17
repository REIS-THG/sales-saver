
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DealModalHeader } from '../DealModalHeader';

describe('DealModalHeader component', () => {
  const mockDeal = {
    id: '1',
    deal_name: 'Test Deal',
    health_score: 75,
    status: 'open',
  };
  
  const mockProps = {
    deal: mockDeal,
    status: 'open' as const,
    isStatusUpdating: false,
    onStatusChange: jest.fn(),
  };

  it('should render the deal name', () => {
    render(<DealModalHeader {...mockProps} />);
    expect(screen.getByText('Test Deal')).toBeInTheDocument();
  });

  it('should display health score with correct color', () => {
    render(<DealModalHeader {...mockProps} />);
    const healthScore = screen.getByText('75%');
    expect(healthScore).toBeInTheDocument();
    expect(healthScore.className).toContain('bg-green-100');
  });

  it('should change status color based on health score value', () => {
    const lowHealthDeal = {
      ...mockDeal,
      health_score: 30,
    };
    
    render(<DealModalHeader {...mockProps} deal={lowHealthDeal} />);
    const healthScore = screen.getByText('30%');
    expect(healthScore.className).toContain('bg-red-100');
  });

  it('should call onStatusChange when status is changed', () => {
    render(<DealModalHeader {...mockProps} />);
    
    // Open the select dropdown
    fireEvent.click(screen.getByRole('combobox'));
    
    // Select 'won' option
    fireEvent.click(screen.getByText('Won'));
    
    expect(mockProps.onStatusChange).toHaveBeenCalledWith('won');
  });

  it('should disable status selection when updating', () => {
    render(<DealModalHeader {...mockProps} isStatusUpdating={true} />);
    
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByText('Updating...')).toBeInTheDocument();
  });
});
