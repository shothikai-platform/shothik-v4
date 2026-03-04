import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Mock dbConnect
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

const { mockLean, mockSort, mockFind } = vi.hoisted(() => {
  const mockLean = vi.fn();
  const mockSort = vi.fn(() => ({ lean: mockLean }));
  const mockFind = vi.fn(() => ({ sort: mockSort }));
  return { mockLean, mockSort, mockFind };
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

  it('should return a list of sessions successfully and use .lean()', async () => {
    const mockSessions = [
      { _id: 'session1', title: 'Test Session 1' },
      { _id: 'session2', title: 'Test Session 2' },
    ];

    mockLean.mockResolvedValue(mockSessions);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled(); // Verification of optimization

    expect(response.status).toBe(200);
    expect((response as any).data).toEqual(mockSessions);
  });

  it('should handle internal server errors', async () => {
    mockLean.mockRejectedValue(new Error('DB Error'));

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(500);
    expect((response as any).data).toEqual({ error: 'Internal Server Error' });
  });
});
