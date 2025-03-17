
import { renderHook, act } from '@testing-library/react-hooks';
import { useDealStatus } from '../useDealStatus';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Deal } from '@/types/types';

// Mock dependencies
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
  },
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

describe('useDealStatus hook', () => {
  const mockToast = jest.fn();
  const mockOnDealUpdated = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  it('should initialize with deal status', () => {
    const mockDeal: Deal = { 
      id: '1', 
      status: 'open',
      deal_name: 'Test Deal',
      company_name: 'Test Company',
      amount: 15000,
      health_score: 75,
      user_id: 'user-123',
      notes: '',
      custom_fields: {}
    };
    const { result } = renderHook(() => useDealStatus(mockDeal));
    
    expect(result.current.status).toBe('open');
    expect(result.current.isStatusUpdating).toBe(false);
  });

  it('should update status when handleStatusChange is called successfully', async () => {
    const mockDeal: Deal = { 
      id: '1', 
      status: 'open',
      deal_name: 'Test Deal',
      company_name: 'Test Company',
      amount: 15000,
      health_score: 75,
      user_id: 'user-123',
      notes: '',
      custom_fields: {}
    };
    
    (supabase.from as jest.Mock).mockImplementation(() => ({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    }));
    
    const { result } = renderHook(() => useDealStatus(mockDeal, mockOnDealUpdated));

    await act(async () => {
      await result.current.handleStatusChange('won');
    });

    expect(result.current.status).toBe('won');
    expect(mockOnDealUpdated).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith({
      title: "Success",
      description: "Status updated successfully.",
    });
  });

  it('should show error toast when status update fails', async () => {
    const mockDeal: Deal = { 
      id: '1', 
      status: 'open',
      deal_name: 'Test Deal',
      company_name: 'Test Company',
      amount: 15000,
      health_score: 75,
      user_id: 'user-123',
      notes: '',
      custom_fields: {}
    };
    
    (supabase.from as jest.Mock).mockImplementation(() => ({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: new Error('Failed to update') }),
    }));
    
    const { result } = renderHook(() => useDealStatus(mockDeal));

    await act(async () => {
      await result.current.handleStatusChange('won');
    });

    expect(result.current.status).toBe('open'); // Status should not change
    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Error",
      description: "Failed to update status. Please try again.",
    });
  });

  it('should do nothing when deal is null', async () => {
    const { result } = renderHook(() => useDealStatus(null));

    await act(async () => {
      await result.current.handleStatusChange('won');
    });

    expect(result.current.status).toBe(null);
    expect(mockToast).not.toHaveBeenCalled();
  });
});
