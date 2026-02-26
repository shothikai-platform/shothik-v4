import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import SheetSession from '@/models/SheetSession';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { NextResponse } from 'next/server';

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
    json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
  },
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
    expect(response.data).toEqual({ error: 'Unauthorized' });
  });

  it('should return user sessions if authenticated', async () => {
    const mockUser = { _id: 'user123', email: 'test@example.com' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSessions = [
      { _id: 'session1', title: 'Session 1', status: 'active', updatedAt: new Date(), createdAt: new Date() },
      { _id: 'session2', title: 'Session 2', status: 'completed', updatedAt: new Date(), createdAt: new Date() },
    ];

    // Mock the chainable query
    const mockLean = vi.fn().mockResolvedValue(mockSessions);
    const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
    const mockSelect = vi.fn().mockReturnValue({ sort: mockSort });
    (SheetSession.find as any).mockReturnValue({ select: mockSelect });

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockSessions);

    // Verify query construction
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user123' });
    expect(mockSelect).toHaveBeenCalledWith('title status updatedAt createdAt');
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    const mockUser = { _id: 'user123', email: 'test@example.com' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    (SheetSession.find as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
            lean: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      }),
    });

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(response.data).toEqual({ error: 'Failed to fetch chats' });
  });
});
