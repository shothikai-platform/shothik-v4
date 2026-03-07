import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

const { mockFind, mockSort, mockLean } = vi.hoisted(() => {
  const lean = vi.fn();
  const sort = vi.fn(() => ({ lean }));
  const find = vi.fn(() => ({ sort }));
  return {
    mockFind: find,
    mockSort: sort,
    mockLean: lean,
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
  });

  it('should return 500 if an error occurs', async () => {
    mockFind.mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(500);
    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' }, { status: 500 });
  });

  it('should return a list of sheet sessions using .lean() optimization', async () => {
    const mockSessions = [
      { _id: 'session1', userId: 'user1', title: 'Session 1' },
      { _id: 'session2', userId: 'user2', title: 'Session 2' },
    ];

    mockLean.mockResolvedValueOnce(mockSessions);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();

    expect(response.status).toBe(200);
    expect((response as any).data).toEqual(mockSessions);
  });
});
