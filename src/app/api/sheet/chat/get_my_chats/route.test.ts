import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import SheetSession from '@/models/SheetSession';
import * as serverAuth from '@/lib/server-auth';

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

// Mock NextResponse
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
    },
  };
});

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should reject unauthenticated users with 401', async () => {
    // Mock no authenticated user
    vi.spyOn(serverAuth, 'getAuthenticatedUser').mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response: any = await GET(request);

    // Verify it returns 401 Unauthorized
    expect(response.status).toBe(401);
    expect(response.data).toEqual({ error: 'Unauthorized' });

    // Verify it NEVER calls the database
    expect(SheetSession.find).not.toHaveBeenCalled();
  });

  it('Should filter sessions by authenticated user ID', async () => {
    const mockUser = { _id: 'user1', name: 'Test User', email: 'test@example.com' };
    const mockSessions = [{ _id: '1', userId: 'user1', title: 'User 1 Session' }];

    // Mock authenticated user
    vi.spyOn(serverAuth, 'getAuthenticatedUser').mockResolvedValue(mockUser);

    const mockSort = vi.fn().mockResolvedValue(mockSessions);
    (SheetSession.find as any).mockReturnValue({ sort: mockSort });

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response: any = await GET(request);

    // Verify it returns success
    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockSessions);

    // Verify it queries with the correct filter
    expect(SheetSession.find).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: expect.stringMatching(/user1/)
      })
    );
  });
});
