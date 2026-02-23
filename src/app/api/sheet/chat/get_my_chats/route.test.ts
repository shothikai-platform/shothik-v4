import { vi, describe, it, expect, beforeEach } from 'vitest';
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

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({ data, init, status: init?.status || 200 })),
  },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(request) as any;

    expect(response.status).toBe(401);
    expect(response.data).toEqual({ error: 'Unauthorized' });
  });

  it('should fetch chats for the authenticated user and map title to name', async () => {
    const mockUser = { _id: 'user123', id: 'user123', name: 'Test User', email: 'test@example.com' };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser);

    const mockSessions = [
      { _id: 'chat1', title: 'Chat 1', status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { _id: 'chat2', title: 'Chat 2', status: 'completed', createdAt: new Date(), updatedAt: new Date() },
    ];

    // Mock chainable Mongoose methods
    const mockQuery = {
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockSessions),
    };
    (SheetSession.find as any).mockReturnValue(mockQuery);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(request) as any;

    expect(getAuthenticatedUser).toHaveBeenCalled();
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: mockUser.id });

    // Verify optimization methods are called
    expect(mockQuery.lean).toHaveBeenCalled();
    expect(mockQuery.select).toHaveBeenCalled();

    expect(response.status).toBe(200);
    expect(response.data).toHaveLength(2);
    // Verify title -> name mapping
    expect(response.data[0]).toHaveProperty('name', 'Chat 1');
    expect(response.data[1]).toHaveProperty('name', 'Chat 2');
  });
});
