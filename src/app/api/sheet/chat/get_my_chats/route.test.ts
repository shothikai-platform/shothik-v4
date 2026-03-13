import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
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

import SheetSession from '@/models/SheetSession';
import dbConnect from '@/lib/dbConnect';

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up chained Mongoose query mock: find().sort().lean()
    mockFind.mockReturnValue({ sort: mockSort });
    mockSort.mockReturnValue({ lean: mockLean });
  });

  it('should return all sheet sessions as plain JavaScript objects using .lean()', async () => {
    const mockSessions = [
      { _id: 'session1', userId: 'user1', title: 'Chat 1', status: 'active' },
      { _id: 'session2', userId: 'user2', title: 'Chat 2', status: 'active' }
    ];

    // the innermost mock is mockLean
    mockLean.mockResolvedValue(mockSessions);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(dbConnect).toHaveBeenCalled();
    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();

    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockSessions);
  });

  it('should handle internal server error', async () => {
    mockLean.mockRejectedValue(new Error('DB connection failed'));

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(500);
    expect(response.data).toEqual({ error: 'Internal Server Error' });
  });
});
