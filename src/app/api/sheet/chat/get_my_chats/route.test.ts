import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

const { mockFind, mockSort, mockLean } = vi.hoisted(() => {
  const mockLeanFn = vi.fn();
  const mockSortFn = vi.fn(() => ({ lean: mockLeanFn }));
  const mockFindFn = vi.fn(() => ({ sort: mockSortFn }));
  return {
    mockFind: mockFindFn,
    mockSort: mockSortFn,
    mockLean: mockLeanFn,
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

  it('should fetch all sessions and return plain JS objects using .lean()', async () => {
    const mockSessions = [
      { _id: 'session1', title: 'Session 1' },
      { _id: 'session2', title: 'Session 2' },
    ];

    mockLean.mockResolvedValue(mockSessions);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();

    expect(NextResponse.json).toHaveBeenCalledWith(mockSessions);
    expect(response.status).toBe(200);
  });

  it('should return 500 if database fetch fails', async () => {
    mockFind.mockImplementation(() => {
      throw new Error('Database error');
    });

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
    expect(response.status).toBe(500);
  });
});
