
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

// Mock process.env
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

const { mockFind, mockSelect, mockSort, mockLean } = vi.hoisted(() => {
  return {
    mockFind: vi.fn(),
    mockSelect: vi.fn(),
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

    // Setup generic mock chain for UNOPTIMIZED behavior (where find().sort() is called)
    // and OPTIMIZED behavior (where find().select().sort().lean() is called)

    mockLean.mockResolvedValue([{ _id: '1', title: 'Chat 1' }]);

    // For optimized chain: select -> sort -> lean
    mockSort.mockReturnValue({ lean: mockLean });
    mockSelect.mockReturnValue({ sort: mockSort });

    // Default behavior for find: return object with select and sort
    // The unoptimized code calls find({}).sort(...)
    mockFind.mockReturnValue({
        select: mockSelect,
        sort: mockSort
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // The unoptimized code MIGHT fail differently (e.g., return all chats or crash if user is null not handled)
    // But we expect 401
    expect(response.status).toBe(401);
  });

  it('should fetch chats filtered by userId with lean and select for performance', async () => {
    const mockUser = { _id: 'user123', id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // 1. Verify userId filtering (IDOR prevention)
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });

    // 2. Verify field selection (Performance)
    expect(mockSelect).toHaveBeenCalledWith('title status createdAt updatedAt');

    // 3. Verify sorting
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });

    // 4. Verify lean (Performance)
    expect(mockLean).toHaveBeenCalled();

    // 5. Verify title is mapped to name for frontend compatibility
    const responseData = (await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'))) as any;
    expect(responseData.data[0].name).toBe('Chat 1');
  });
});
