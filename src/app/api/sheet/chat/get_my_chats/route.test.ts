
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock Mongoose model
const { mockFind, mockSort } = vi.hoisted(() => {
    const mockSort = vi.fn();
    const mockFind = vi.fn(() => ({ sort: mockSort }));
    return { mockFind, mockSort };
});

vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      find: mockFind,
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
  });

  it('should fetch chats scoped to the user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockSort.mockResolvedValue([{ _id: '1', title: 'Sheet 1' }]);

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
  });

  it('should fetch chats scoped to the user using id fallback', async () => {
      const mockUser = { id: 'user456' }; // No _id
      (getAuthenticatedUser as any).mockResolvedValue(mockUser);
      mockSort.mockResolvedValue([{ _id: '2', title: 'Sheet 2' }]);

      await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

      expect(mockFind).toHaveBeenCalledWith({ userId: 'user456' });
    });
});
