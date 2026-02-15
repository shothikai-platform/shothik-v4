
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

// Mock authentication
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

// Hoist mocks for Mongoose chain
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

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup generic mock chain
    mockLean.mockResolvedValue([{ _id: '1', title: 'Sheet Chat 1' }]);
    mockSort.mockReturnValue({ lean: mockLean });

    // Default behavior for find: return object with sort
    mockFind.mockReturnValue({
        sort: mockSort
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
  });

  it('should fetch sessions filtered by user and optimized with lean()', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Verify user filtering (SECURITY + PERFORMANCE)
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });

    // Verify sorting
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });

    // Verify lean() is called (PERFORMANCE)
    expect(mockLean).toHaveBeenCalled();
  });
});
