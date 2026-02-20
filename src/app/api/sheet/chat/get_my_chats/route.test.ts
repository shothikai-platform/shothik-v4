
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

    // Setup generic mock chain
    mockLean.mockResolvedValue([{ _id: '1', title: 'Sheet 1', status: 'active', updatedAt: new Date() }]);

    // Chain behavior: find -> sort -> lean (current implementation)
    // OR find -> select -> sort -> lean (optimized implementation)

    // We mock sort to return an object with lean
    mockSort.mockReturnValue({ lean: mockLean });

    // We mock select to return an object with sort
    mockSelect.mockReturnValue({ sort: mockSort });

    // Default behavior for find: return object with sort (simulating current implementation)
    // But we also include select so if the code calls select, it works
    mockFind.mockReturnValue({
        sort: mockSort,
        select: mockSelect
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
  });

  it('should fetch chats scoped to the user and optimized', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // 1. Verify user scoping
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });

    // 2. Verify field selection optimization
    // We expect .select to be called with specific fields
    expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('title status updatedAt createdAt'));

    // 3. Verify lean() is used for performance
    expect(mockLean).toHaveBeenCalled();

    // 4. Verify sorting
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
  });
});
