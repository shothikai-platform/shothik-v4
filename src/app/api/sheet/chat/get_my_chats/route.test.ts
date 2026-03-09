import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Mock dbConnect
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

const { mockLean, mockSort, mockFind } = vi.hoisted(() => {
  const mockLean = vi.fn();
  const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
  const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
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

  it('should fetch all sessions sorted and lean', async () => {
    const mockSessions = [
      { _id: '1', title: 'Session 1', status: 'active', updatedAt: new Date() },
      { _id: '2', title: 'Session 2', status: 'active', updatedAt: new Date() }
    ];

    mockLean.mockResolvedValue(mockSessions);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();

    // Using our mock next/server which returns an object representing the response
    expect(response.status).toBe(200);
    expect((response as any).data).toEqual(mockSessions);
  });

  it('should handle errors correctly', async () => {
    mockLean.mockRejectedValue(new Error('DB Error'));

    // Prevent console.error from polluting test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(500);
    expect((response as any).data).toEqual({ error: 'Internal Server Error' });

    consoleSpy.mockRestore();
  });
});
