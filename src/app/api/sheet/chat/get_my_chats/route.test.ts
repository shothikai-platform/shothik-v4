import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

// Mock dependencies
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => ({
  default: {
    find: vi.fn(),
  },
}));

vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn((data, options) => ({
        data,
        options,
        status: options?.status || 200,
      })),
    },
  };
});

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
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
    expect(SheetSession.find).not.toHaveBeenCalled();
  });

  it('should fetch sessions scoped to the authenticated user', async () => {
    const mockUserId = 'user-123';
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      _id: mockUserId,
      name: 'Test User',
      email: 'test@example.com',
    });

    const mockSessions = [
      { _id: 'session-1', title: 'Chat 1' },
      { _id: 'session-2', title: 'Chat 2' },
    ];

    const mockLean = vi.fn().mockResolvedValue(mockSessions);
    const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
    vi.mocked(SheetSession.find).mockReturnValue({ sort: mockSort } as any);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(request) as any;

    expect(SheetSession.find).toHaveBeenCalledWith({ userId: mockUserId });
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();

    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockSessions);
  });

  it('should return 500 on internal errors', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      _id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    });
    vi.mocked(SheetSession.find).mockImplementation(() => {
      throw new Error('Database Error');
    });

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(request) as any;

    expect(response.status).toBe(500);
    expect(response.data).toEqual({ error: 'Internal Server Error' });
  });
});
