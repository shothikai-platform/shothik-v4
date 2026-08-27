import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';
import dbConnect from '@/lib/dbConnect';

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => ({
  default: {
    find: vi.fn(),
  },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: 'Unauthorized' });
    expect(SheetSession.find).not.toHaveBeenCalled();
  });

  it('should return user spreadsheet sessions filtered by userId', async () => {
    const mockUser = { _id: 'user-123', email: 'test@example.com', name: 'Test User' };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser);
    vi.mocked(dbConnect).mockResolvedValue({} as any);

    const mockSessions = [
      { _id: 'session-1', title: 'Sheet 1', userId: 'user-123' },
      { _id: 'session-2', title: 'Sheet 2', userId: 'user-123' },
    ];

    const mockSort = vi.fn().mockResolvedValue(mockSessions);
    vi.mocked(SheetSession.find).mockReturnValue({ sort: mockSort } as any);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user-123' });
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(body).toEqual(mockSessions);
  });
});
