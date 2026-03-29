
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

const { mockFind, mockLean, mockSort } = vi.hoisted(() => {
  return {
    mockFind: vi.fn(),
    mockLean: vi.fn(),
    mockSort: vi.fn(),
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
    mockLean.mockResolvedValue([{ _id: '1', title: 'Session 1' }]);
    mockSort.mockReturnValue({ lean: mockLean });

    // IMPORTANT: The current (buggy) implementation returns a promise from sort() directly,
    // whereas the correct (fixed) implementation will chain .lean().
    // We setup the mock so it can handle BOTH.
    // If .lean() is NOT called, sort() resolves to the value.
    // If .lean() IS called, sort() returns the object with lean().

    // However, to make the test stricter, let's make sort return an object with lean,
    // AND make that object awaitable if possible? No, that's complex.

    // Let's just mock sort to return an object with lean.
    // If the code awaits sort(), it will get the object { lean: ... }, which is truthy but not the array of sessions.
    // This might cause the current implementation to return { lean: ... } as JSON, which is technically a "success" but wrong data.
    // But we are asserting on arguments passed to find(), so that's fine.

    mockFind.mockReturnValue({
        sort: mockSort
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
  });

  it('should fetch sessions filtered by userId and optimized with lean()', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Verify user filtering (IDOR protection)
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });

    // Verify sort
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });

    // Verify performance optimization
    expect(mockLean).toHaveBeenCalled();
  });
});
