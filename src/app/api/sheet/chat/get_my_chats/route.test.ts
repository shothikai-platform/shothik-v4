import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => ({
  default: {
    find: vi.fn(),
  },
}));

import SheetSession from '@/models/SheetSession';
import { getAuthenticatedUser } from '@/lib/server-auth';

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const req = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('should return user sessions when user is authenticated', async () => {
    const mockUser = { _id: 'user123', email: 'test@example.com' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSessions = [
      { _id: 'session1', title: 'Sheet 1', userId: 'user123' },
    ];

    const mockSort = vi.fn().mockReturnThis();
    const mockLean = vi.fn().mockResolvedValue(mockSessions);

    (SheetSession.find as any).mockReturnValue({
      sort: mockSort,
      lean: mockLean,
    });

    const req = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user123' });
    expect(body).toEqual(mockSessions);
  });

  it('should return 500 when database operation fails', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (SheetSession.find as any).mockImplementation(() => {
      throw new Error('Database failure');
    });

    const req = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ error: 'Internal Server Error' });
  });
});
