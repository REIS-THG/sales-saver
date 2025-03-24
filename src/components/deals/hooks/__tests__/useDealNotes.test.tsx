import { renderHook, act } from '@testing-library/react-hooks';
import { useDealNotes } from '../useDealNotes';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useApiError } from '@/hooks/use-api-error';

jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

jest.mock('@/hooks/use-api-error', () => ({
  useApiError: jest.fn(() => ({
    handleAuthCheck: jest.fn().mockResolvedValue('test-user-id'),
    handleError: jest.fn(),
    handleSuccess: jest.fn(),
  })),
}));

describe('useDealNotes hook', () => {
  const dealId = 'test-deal-id';
  const userId = 'test-user-id';
  const noteContent = 'test note content';

  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockInsert: jest.Mock;
  let mockOrder: jest.Mock;
  let mockEq: jest.Mock;
  let mockThen: jest.Mock;
  let mockSuccess: jest.Mock;

  beforeEach(() => {
    mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    }));
    mockSelect = jest.fn().mockReturnThis();
    mockInsert = jest.fn().mockReturnThis();
    mockOrder = jest.fn().mockReturnThis();
    mockEq = jest.fn().mockReturnThis();
    mockThen = jest.fn().mockResolvedValue({ data: [], error: null });
    mockSuccess = jest.fn();

    (supabase.from as jest.Mock).mockImplementation(mockFrom);
    (useToast as jest.Mock).mockReturnValue({ toast: jest.fn() });
    (useApiError as jest.Mock).mockReturnValue({
      handleAuthCheck: jest.fn().mockResolvedValue(userId),
      handleError: jest.fn(),
      handleSuccess: mockSuccess,
    });
  });

  it('should fetch notes successfully', async () => {
    const mockNotes = [{ id: '1', content: 'Note 1' }, { id: '2', content: 'Note 2' }];
    (mockFrom as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: mockNotes, error: null }),
    });

    const { result, waitForNextUpdate } = renderHook(() => useDealNotes(dealId));

    await waitForNextUpdate();

    expect(result.current.notes).toEqual(mockNotes);
    expect(supabase.from).toHaveBeenCalledWith('deal_notes');
    expect(mockFrom().select).toHaveBeenCalled();
    expect(mockFrom().order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(mockFrom().eq).toHaveBeenCalledWith('deal_id', dealId);
  });

  it('should add a note successfully', async () => {
    mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [{ id: '3', content: noteContent }], error: null }),
    }));
    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    const { result } = renderHook(() => useDealNotes(dealId));

    await act(async () => {
      await result.current.addNote(noteContent);
    });
    
    expect(mockSuccess).toHaveBeenCalledWith('Note added successfully');
    expect(mockFrom).toHaveBeenCalledWith('deal_notes');
    expect(mockInsert).toHaveBeenCalledWith({
      deal_id: dealId,
      user_id: userId,
      content: noteContent
    });
    expect(mockThen).toHaveBeenCalled();
  });

  it('should handle errors when adding a note', async () => {
    const mockError = new Error('Failed to add note');
    (mockFrom as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: null, error: mockError }),
    });
    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    const { result } = renderHook(() => useDealNotes(dealId));
    const { handleError } = useApiError();

    await act(async () => {
      await result.current.addNote(noteContent);
    });

    expect(handleError).toHaveBeenCalledWith(mockError, 'Failed to add note');
  });
});
