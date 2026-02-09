
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

// Hoisted mocks for Mongoose chain
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

    // Setup mock chain
    mockLean.mockResolvedValue([{ _id: 'session1', title: 'Session 1' }]);

    // mockSort returns an object that has .lean() and is also awaitable (for the old code or if lean is forgotten)
    // However, if the code awaits sort() directly, it gets the resolved value.
    // If the code calls sort().lean(), it gets the result of lean().
    const mockQuery = {
        lean: mockLean,
        // making it thenable to support await sort(...) if needed, though we want to enforce lean usage
        then: (resolve: any) => resolve([{ _id: 'session1' }])
    };
    mockSort.mockReturnValue(mockQuery);

    // Default behavior for find
    mockFind.mockReturnValue({
        sort: mockSort
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
  });

  it('should fetch only user chats and use lean optimization', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Verify it queries with the correct userId
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });

    // Verify it sorts correctly
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });

    // Verify it uses lean()
    expect(mockLean).toHaveBeenCalled();
  });
});
