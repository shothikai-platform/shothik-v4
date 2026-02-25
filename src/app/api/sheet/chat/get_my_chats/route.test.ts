
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

    const mockSessions = [{ _id: '1', title: 'Chat 1' }];

    // Mock lean to return sessions
    mockLean.mockResolvedValue(mockSessions);

    // Mock sort to be awaitable (for current impl) AND chainable to lean (for future impl)
    const sortResult = {
      lean: mockLean,
      then: (resolve) => resolve(mockSessions) // Makes it awaitable directly
    };

    mockSort.mockReturnValue(sortResult);

    // Mock find to return object with sort
    mockFind.mockReturnValue({
        sort: mockSort
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Current insecure impl returns 200. We expect 401 for security.
    // If this fails (received 200), we have confirmed the vulnerability.
    expect(response.status).toBe(401);
  });

  it('should scope query to authenticated user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Current insecure impl calls find({})
    // We expect find({ userId: ... })
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });

    // Also verify lean is called for performance (part of the fix)
    expect(mockLean).toHaveBeenCalled();
  });
});
