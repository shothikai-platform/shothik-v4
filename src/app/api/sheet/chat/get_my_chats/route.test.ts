import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';
import SheetSession from '@/models/SheetSession';
import * as serverAuth from '@/lib/server-auth';

// Mock dependencies
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      data,
      status: options?.status || 200,
      json: async () => data,
    })),
  },
}));

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => {
  const mockLean = vi.fn().mockResolvedValue([{ _id: 'session-1', title: 'Test Session', userId: 'user-123' }]);
  const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
  const mockFind = vi.fn().mockReturnValue({ sort: mockSort });

  return {
    default: {
      find: mockFind,
    },
  };
});

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

describe('SheetChat get_my_chats GET Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    // Mock user as not authenticated
    vi.mocked(serverAuth.getAuthenticatedUser).mockResolvedValue(null);

    const mockRequest = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(SheetSession.find).not.toHaveBeenCalled();
  });

  it('should return user sessions successfully when authenticated', async () => {
    // Mock user as authenticated
    const mockUser = { _id: 'user-123', name: 'Test User', email: 'test@example.com' };
    vi.mocked(serverAuth.getAuthenticatedUser).mockResolvedValue(mockUser);

    const mockRequest = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user-123' });
    expect(data).toHaveLength(1);
    expect(data[0].title).toBe('Test Session');
  });

  it('should handle db error gracefully', async () => {
    // Mock user as authenticated
    const mockUser = { _id: 'user-123', name: 'Test User', email: 'test@example.com' };
    vi.mocked(serverAuth.getAuthenticatedUser).mockResolvedValue(mockUser);

    // Mock find to throw error
    vi.mocked(SheetSession.find).mockImplementationOnce(() => {
      throw new Error('Database Error');
    });

    const mockRequest = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal Server Error');
  });
});
