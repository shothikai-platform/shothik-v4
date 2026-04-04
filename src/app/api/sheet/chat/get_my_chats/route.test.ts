
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

const { mockFind, mockSort } = vi.hoisted(() => {
  const mockSortFn = vi.fn();
  const mockFindFn = vi.fn(() => ({
    sort: mockSortFn,
  }));
  return {
    mockFind: mockFindFn,
    mockSort: mockSortFn,
  };
});

// Mock Mongoose model
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
    json: vi.fn((data, options) => ({
        data,
        options,
        status: options?.status || 200,
        json: async () => data
    })),
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);
    mockSort.mockResolvedValue([]);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Current behavior: 200 (returns chats regardless of auth)
    // Desired behavior: 401 (Unauthorized)
    expect(response.status).toBe(401);
  });

  it('should only return chats belonging to the authenticated user', async () => {
    const user = { _id: 'user1' };
    (getAuthenticatedUser as any).mockResolvedValue(user);

    mockSort.mockResolvedValue([
        { _id: 'chat1', userId: 'user1', title: 'My Chat' },
        { _id: 'chat2', userId: 'user2', title: 'Not My Chat' }
    ]);

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Current behavior: find({}) is called (no filtering)
    // Desired behavior: find({ userId: 'user1' }) should be called
    expect(mockFind).toHaveBeenCalledWith({ userId: user._id });
  });
});
