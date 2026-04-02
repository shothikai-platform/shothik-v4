
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
  const sortFn = vi.fn().mockReturnThis();
  const findFn = vi.fn().mockReturnValue({ sort: sortFn });
  return {
    mockFind: findFn,
    mockSort: sortFn,
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

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
  });

  it('should filter sessions by authenticated user', async () => {
    const mockUser = { _id: 'user1' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // In a real scenario, MongoDB would only return sessions for user1 because of the filter.
    // Our mock should reflect what we expect from the DB when the filter is applied.
    mockSort.mockResolvedValue([
        { _id: 'session1', userId: 'user1' }
    ]);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Check that the filter was correctly passed to the find method
    expect(mockFind).toHaveBeenCalledWith({ userId: mockUser._id });

    const data = await response.json();
    expect(data).toHaveLength(1);
    expect(data[0].userId).toBe('user1');
  });
});
