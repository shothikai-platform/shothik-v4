import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import SheetSession from '@/models/SheetSession';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Hoist mocks
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => ({
  default: {
    find: vi.fn(),
  },
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ body, init })),
  },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const req = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(req) as any;

    // This is expected to fail currently because the auth check is missing
    expect(response.init?.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
  });

  it('should fetch sessions only for the authenticated user', async () => {
    const mockUser = { _id: 'user-123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSort = vi.fn().mockResolvedValue(['session1', 'session2']);
    (SheetSession.find as any).mockReturnValue({
      sort: mockSort,
    });

    const req = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(req) as any;

    expect(response.body).toEqual(['session1', 'session2']);

    // This is expected to fail currently because it calls find({})
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user-123' });
  });
});
