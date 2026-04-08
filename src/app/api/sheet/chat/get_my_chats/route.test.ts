
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
  return {
    mockFind: vi.fn(),
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
    json: vi.fn((data, options) => ({
        data,
        options,
        status: options?.status || 200,
        json: async () => data
    })),
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup generic mock chain
    mockSort.mockResolvedValue([{ _id: '1', title: 'Session 1' }]);
    mockFind.mockReturnValue({
        sort: mockSort
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
    expect(mockFind).not.toHaveBeenCalled();
  });

  it('should fetch chats filtered by user ID if authenticated', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([{ _id: '1', title: 'Session 1' }]);
  });
});
