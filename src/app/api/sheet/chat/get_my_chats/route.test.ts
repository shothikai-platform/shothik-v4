import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import SheetSession from '@/models/SheetSession';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
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

  it('should fetch chats filtered by authenticated user', async () => {
    const mockUser = { _id: 'user123', id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSort = vi.fn().mockResolvedValue([]);
    const mockSelect = vi.fn().mockReturnValue({ sort: mockSort });

    const mockQuery = {
        sort: mockSort,
        select: mockSelect,
    };

    (SheetSession.find as any).mockReturnValue(mockQuery);

    const req = new Request('http://localhost/api/sheet/chat/get_my_chats');
    await GET(req);

    expect(SheetSession.find).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user123' })
    );
  });

  it('should return 401 if not authenticated', async () => {
      (getAuthenticatedUser as any).mockResolvedValue(null);

      const req = new Request('http://localhost/api/sheet/chat/get_my_chats');
      const response = (await GET(req)) as any;

      expect(response.init?.status).toBe(401);
      expect(SheetSession.find).not.toHaveBeenCalled();
  });
});
