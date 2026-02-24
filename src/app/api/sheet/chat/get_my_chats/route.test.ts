
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Mock environment variable
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

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
    mockSort.mockReturnValue({ lean: mockLean });
    // Default mock behavior for find so unoptimized code doesn't crash
    mockFind.mockReturnValue({ sort: mockSort });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
  });

  it('should fetch chats for the authenticated user only', async () => {
    const mockUser = { _id: 'user123', id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Check strict scoping to userId
    // Note: The implementation should check for user._id OR user.id
    // But for the test we assert that at least one valid ID is passed.
    // The implementation should look like: SheetSession.find({ userId: user._id || user.id })
    // So we expect mockFind to be called with { userId: 'user123' }
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });

    // Ensure sort is called
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });

    // Verify lean is called for performance
    expect(mockLean).toHaveBeenCalled();
  });
});
