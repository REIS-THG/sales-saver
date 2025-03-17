
import { renderHook, act } from '@testing-library/react-hooks';
import { useDealNotes } from '../useDealNotes';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    functions: {
      invoke: jest.fn(),
    },
    auth: {
      getUser: jest.fn(),
    },
  },
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

describe('useDealNotes hook', () => {
  const mockToast = jest.fn();
  const mockOnDealUpdated = jest.fn();
  const mockUserId = 'user-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ 
      data: { user: { id: mockUserId } },
      error: null
    });
  });

  it('should fetch notes when fetchNotes is called', async () => {
    const mockDeal = { id: '1' };
    const mockNotes = [
      { id: '1', content: 'Note 1' },
      { id: '2', content: 'Note 2' },
    ];
    
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockNotes, error: null }),
    }));
    
    const { result } = renderHook(() => useDealNotes(mockDeal));

    await act(async () => {
      await result.current.fetchNotes();
    });

    expect(result.current.notes).toEqual(mockNotes);
  });

  it('should add a note and analyze it when handleAddNote is called', async () => {
    const mockDeal = { id: '1' };
    const mockAnalysisResult = { 
      sentiment_score: 75,
      health_score: 80,
      key_points: ['Point 1'],
      next_actions: ['Action 1']
    };
    
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: mockAnalysisResult,
      error: null
    });
    
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'deal_notes') {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === 'deals') {
        return {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
    });
    
    const { result } = renderHook(() => useDealNotes(mockDeal, mockOnDealUpdated));

    act(() => {
      result.current.setNewNote('Test note content');
    });

    await act(async () => {
      await result.current.handleAddNote();
    });

    expect(supabase.functions.invoke).toHaveBeenCalledWith('analyze-note', {
      body: expect.objectContaining({
        noteContent: 'Test note content',
        dealContext: expect.any(String)
      })
    });
    
    expect(mockToast).toHaveBeenCalledWith({
      title: "Success",
      description: "Note added and analyzed successfully.",
    });
    
    expect(mockOnDealUpdated).toHaveBeenCalled();
    expect(result.current.newNote).toBe('');
  });

  it('should show error toast when note addition fails', async () => {
    const mockDeal = { id: '1' };
    
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: { sentiment_score: 75 },
      error: null
    });
    
    (supabase.from as jest.Mock).mockImplementation(() => ({
      insert: jest.fn().mockResolvedValue({ error: new Error('Failed to add note') }),
    }));
    
    const { result } = renderHook(() => useDealNotes(mockDeal));

    act(() => {
      result.current.setNewNote('Test note content');
    });

    await act(async () => {
      await result.current.handleAddNote();
    });

    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Error",
      description: "Failed to add note. Please try again.",
    });
  });

  it('should not attempt to add a note when deal is null', async () => {
    const { result } = renderHook(() => useDealNotes(null));

    act(() => {
      result.current.setNewNote('Test note content');
    });

    await act(async () => {
      await result.current.handleAddNote();
    });

    expect(supabase.functions.invoke).not.toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should not add empty notes', async () => {
    const mockDeal = { id: '1' };
    const { result } = renderHook(() => useDealNotes(mockDeal));

    act(() => {
      result.current.setNewNote('  '); // Empty or whitespace
    });

    await act(async () => {
      await result.current.handleAddNote();
    });

    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });
});
