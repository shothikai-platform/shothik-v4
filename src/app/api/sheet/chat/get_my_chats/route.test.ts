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
    find: vi.fn().mockReturnThis(),
    sort: vi.fn(),
  },
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET({} as Request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should fetch and return sheet sessions for the authenticated user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSessions = [
      { _id: 'session1', title: 'Chat 1' },
      { _id: 'session2', title: 'Chat 2' },
    ];
    (SheetSession.find as any).mockReturnValue({
      sort: vi.fn().mockResolvedValue(mockSessions),
    });

    const response = await GET({} as Request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockSessions);
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user123' });
  });

  it('should handle errors gracefully', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (SheetSession.find as any).mockImplementation(() => {
      throw new Error('Database error');
    });

    const response = await GET({} as Request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal Server Error' });
  });
});
