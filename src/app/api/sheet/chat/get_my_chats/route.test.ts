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

// Hoist mock functions for use in vi.mock
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

    // Setup generic mock chain for successful flow
    mockLean.mockResolvedValue([
      { _id: '1', title: 'Sheet 1', updatedAt: new Date().toISOString() },
      { _id: '2', title: 'Sheet 2', updatedAt: new Date().toISOString() }
    ]);
    mockSort.mockReturnValue({ lean: mockLean });
    mockSelect.mockReturnValue({ sort: mockSort });

    // Default behavior for find: return object with select
    mockFind.mockReturnValue({
        select: mockSelect,
        sort: mockSort // Fallback if select is missed in implementation but sort is called directly
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
    expect(mockFind).not.toHaveBeenCalled();
  });

  it('should fetch chats for the authenticated user only', async () => {
    const mockUser = { _id: 'user123', id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Verify user ID scoping
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });

    // Verify optimization and security (field selection)
    expect(mockSelect).toHaveBeenCalledWith('title status updatedAt');

    // Verify sorting
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });

    // Verify lean
    expect(mockLean).toHaveBeenCalled();
  });
});
