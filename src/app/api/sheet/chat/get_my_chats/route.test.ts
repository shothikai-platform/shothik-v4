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

// Setup mock chaining
mockFind.mockReturnValue({ sort: mockSort });
mockSort.mockReturnValue({ lean: mockLean });

// Mock Mongoose model
vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      find: mockFind,
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn((data, options) => {
        return {
          data,
          status: options?.status || 200,
        };
      }),
    },
  };
});

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFind.mockReturnValue({ sort: mockSort });
    mockSort.mockReturnValue({ lean: mockLean });
  });

  it('should successfully fetch sessions and return a 200 response', async () => {
    const mockSessions = [
      { _id: 'session1', title: 'Chat 1', status: 'active' },
      { _id: 'session2', title: 'Chat 2', status: 'active' },
    ];

    // Provide resolving value to the final step of the chain
    mockLean.mockResolvedValue(mockSessions);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockSessions);
  });

  it('should handle errors gracefully and return a 500 response', async () => {
    // Make the chain throw an error
    mockLean.mockRejectedValue(new Error('Database error'));

    // Suppress console.error during tests
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(mockFind).toHaveBeenCalledWith({});
    expect(response.status).toBe(500);
    expect(response.data).toEqual({ error: 'Internal Server Error' });

    consoleSpy.mockRestore();
  });
});
