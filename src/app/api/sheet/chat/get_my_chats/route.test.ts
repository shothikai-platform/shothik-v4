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

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup generic mock chain
    const mockId = '1234567890abcdef12345678';
    mockLean.mockResolvedValue([{
        _id: { toString: () => mockId },
        title: 'Session 1',
        status: 'active'
    }]);
    mockSort.mockReturnValue({ lean: mockLean });

    // Default behavior for find
    mockFind.mockReturnValue({
        sort: mockSort
    });
  });

  it('should fetch sessions using .lean() for performance', async () => {
    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });

    // THIS IS THE CRITICAL ASSERTION
    // It verifies that .lean() was called
    expect(mockLean).toHaveBeenCalled();
  });

  it('should map _id to id to preserve API contract after using .lean()', async () => {
    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Extract the JSON data passed to NextResponse.json
    const responseData = (NextResponse.json as any).mock.calls[0][0];

    // Verify it returns an array
    expect(Array.isArray(responseData)).toBe(true);

    // Verify the id property was mapped correctly
    expect(responseData[0]).toHaveProperty('id', '1234567890abcdef12345678');
    // Verify other properties are preserved
    expect(responseData[0]).toHaveProperty('title', 'Session 1');
    expect(responseData[0]).toHaveProperty('_id');
  });

  it('should return 500 on internal server error', async () => {
    mockFind.mockImplementationOnce(() => {
        throw new Error('DB Error');
    });

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));
    const options = (NextResponse.json as any).mock.calls[0][1];

    expect(options.status).toBe(500);
  });
});
