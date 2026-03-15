import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

const { mockFind, mockSort, mockLean } = vi.hoisted(() => {
  const mockLean = vi.fn();
  const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
  const mockFind = vi.fn().mockReturnValue({ sort: mockSort });

  return { mockFind, mockSort, mockLean };
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
  });

  it('should return 200 and a list of sheet sessions', async () => {
    const mockSessions = [
      { _id: 'session1', userId: 'user1', title: 'Session 1', status: 'active' },
      { _id: 'session2', userId: 'user2', title: 'Session 2', status: 'completed' },
    ];
    mockLean.mockResolvedValue(mockSessions);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();

    expect(NextResponse.json).toHaveBeenCalledWith(mockSessions);
    expect(response.status).toBe(200);
  });

  it('should return 500 if there is a database error', async () => {
    mockFind.mockImplementationOnce(() => {
      throw new Error('Database Error');
    });

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
    expect(response.status).toBe(500);
  });
});
