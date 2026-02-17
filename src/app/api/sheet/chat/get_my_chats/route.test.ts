import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import SheetSession from '@/models/SheetSession';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => {
  const mockLean = vi.fn().mockResolvedValue([]);
  const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
  // Make the sort result also thenable so the unoptimized code (which awaits sort directly)
  // resolves to the array, preventing "Type Error" or unexpected object returns in tests if needed.
  // However, since we are testing for the optimized path, we mainly care about the chain.
  // We'll add a 'then' property to simulating a Promise that resolves to [] for the unoptimized case
  // so it doesn't return the mock object itself.
  (mockSort as any).mockImplementation(() => ({
    lean: mockLean,
    then: (resolve: any) => resolve([]),
  }));

  const mockFind = vi.fn().mockReturnValue({ sort: mockSort });

  return {
    default: {
      find: mockFind,
    },
  };
});

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should fetch sessions for the authenticated user only', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(request);

    expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user123' });
    expect(response.status).toBe(200);
  });

  it('should use .lean() for performance', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    await GET(request);

    // Verify chain: find -> sort -> lean
    // We access the mock.results to see what was returned and if lean was called on it
    const findResult = (SheetSession.find as any).mock.results[0].value;
    const sortResult = findResult.sort.mock.results[0].value;

    expect(sortResult.lean).toHaveBeenCalled();
  });
});
