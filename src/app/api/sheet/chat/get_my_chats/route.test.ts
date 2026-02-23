import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';
import dbConnect from '@/lib/dbConnect';

vi.mock('@/lib/server-auth');
vi.mock('@/models/SheetSession');
vi.mock('@/lib/dbConnect');

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);
    const response = await GET(new Request('http://localhost'));
    expect(response.status).toBe(401);
  });

  it('should return only sessions for the authenticated user', async () => {
    const mockUser = { _id: 'user123' };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser as any);

    const mockSessions = [{ _id: 'session1', title: 'Session 1', userId: 'user123' }];
    const mockQuery = {
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockSessions),
    };
    vi.mocked(SheetSession.find).mockReturnValue(mockQuery as any);

    const response = await GET(new Request('http://localhost'));
    const data = await response.json();

    expect(dbConnect).toHaveBeenCalled();
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user123' });
    expect(response.status).toBe(200);
    expect(data).toEqual(mockSessions);
  });
});
