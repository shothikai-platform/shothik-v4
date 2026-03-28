
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

const { mockFind, mockSort, mockLean } = vi.hoisted(() => {
  return {
    mockFind: vi.fn(),
    mockSort: vi.fn(),
    mockLean: vi.fn(),
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
    json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup generic mock chain
    mockLean.mockResolvedValue([{ _id: '1', title: 'Chat 1' }]);

    // We make sort return an object with lean, so logic using .lean() works.
    // For existing logic awaiting sort(), it will receive this object, which is fine for the test run (it won't crash).
    mockSort.mockReturnValue({ lean: mockLean });

    mockFind.mockReturnValue({ sort: mockSort });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Existing code does NOT check auth, so it will return 200 (or fail if user is null/undefined usage, but it doesn't use user)
    // Actually existing code just runs queries.
    // So this assertion will FAIL, which is what we want.
    expect(response.status).toBe(401);
  });

  it('should fetch chats with user filtering and lean optimization', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Existing code will fail here because it calls find({})
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });

    // Existing code will fail here because it doesn't call lean()
    expect(mockLean).toHaveBeenCalled();

    // And ensure sort is called
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
  });
});
