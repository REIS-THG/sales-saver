
import { renderHook, act } from '@testing-library/react-hooks';
import { useDealNotes } from '../useDealNotes';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useApiError } from '@/hooks/use-api-error';
import { Deal } from '@/types/types';

jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    }),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null })
    },
    functions: {
      invoke: jest.fn().mockResolvedValue({ data: {}, error: null })
    }
  },
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn().mockReturnValue({
    toast: jest.fn(),
  }),
}));

jest.mock('@/hooks/use-api-error', () => ({
  useApiError: jest.fn().mockReturnValue({
    handleAuthCheck: jest.fn().mockResolvedValue('test-user-id'),
    handleError: jest.fn(),
    handleSuccess: jest.fn(),
  }),
}));

describe('useDealNotes hook', () => {
  const mockDeal: Deal = {
    id: 'test-deal-id',
    deal_name: 'Test Deal',
    company_name: 'Test Company',
    amount: 1000,
    status: 'open',
    health_score: 75,
    user_id: 'test-user-id',
    notes: ''
  };
  
  const userId = 'test-user-id';
  const noteContent = 'test note content';

  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockInsert: jest.Mock;
  let mockOrder: jest.Mock;
  let mockEq: jest.Mock;
  let mockThen: jest.Mock;
  let mockSuccess: jest.Mock;
  let mockInvoke: jest.Mock;

  beforeEach(() => {
    mockSelect = jest.fn().mockReturnThis();
    mockInsert = jest.fn().mockReturnThis();
    mockOrder = jest.fn().mockReturnThis();
    mockEq = jest.fn().mockReturnThis();
    mockThen = jest.fn().mockResolvedValue({ data: [], error: null });
    mockSuccess = jest.fn();
    mockInvoke = jest.fn().mockResolvedValue({ data: {}, error: null });

    mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      order: mockOrder,
      eq: mockEq,
      then: mockThen,
    });

    (supabase.from as jest.Mock).mockImplementation(mockFrom);
    (supabase.functions.invoke as jest.Mock).mockImplementation(mockInvoke);
    (useToast as jest.Mock).mockReturnValue({ toast: jest.fn() });
    (useApiError as jest.Mock).mockReturnValue({
      handleAuthCheck: jest.fn().mockResolvedValue(userId),
      handleError: jest.fn(),
      handleSuccess: mockSuccess,
    });
  });

  it('should fetch notes successfully', async () => {
    const mockNotes = [{ id: '1', content: 'Note 1' }, { id: '2', content: 'Note 2' }];
    mockThen.mockResolvedValueOnce({ data: mockNotes, error: null });

    const { result, waitForNextUpdate } = renderHook(() => useDealNotes(mockDeal));

    await waitForNextUpdate();

    expect(result.current.notes).toEqual(mockNotes);
    expect(supabase.from).toHaveBeenCalledWith('deal_notes');
    expect(mockSelect).toHaveBeenCalled();
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(mockEq).toHaveBeenCalledWith('deal_id', mockDeal.id);
  });

  it('should add a note successfully', async () => {
    const analyzeResult = { 
      sentiment_score: 75,
      health_score: 80
    };
    
    mockInvoke.mockResolvedValueOnce({ data: analyzeResult, error: null });
    mockThen.mockResolvedValueOnce({ data: null, error: null });
    
    const { result } = renderHook(() => useDealNotes(mockDeal));
    
    result.current.setNewNote(noteContent);

    await act(async () => {
      await result.current.handleAddNote();
    });
    
    expect(supabase.functions.invoke).toHaveBeenCalledWith('analyze-note', {
      body: expect.objectContaining({
        noteContent: noteContent
      })
    });
    expect(mockSuccess).toHaveBeenCalledWith(expect.any(String));
    expect(mockFrom).toHaveBeenCalledWith('deal_notes');
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      deal_id: mockDeal.id,
      user_id: userId,
      content: noteContent,
      sentiment_score: analyzeResult.sentiment_score,
      ai_analysis: analyzeResult
    }));
  });

  it('should handle errors when adding a note', async () => {
    const mockError = new Error('Failed to add note');
    mockThen.mockResolvedValueOnce({ data: null, error: mockError });
    
    const { result } = renderHook(() => useDealNotes(mockDeal));
    const { handleError } = useApiError();
    
    result.current.setNewNote(noteContent);

    await act(async () => {
      await result.current.handleAddNote();
    });

    expect(handleError).toHaveBeenCalledWith(mockError, expect.any(String));
  });
});
