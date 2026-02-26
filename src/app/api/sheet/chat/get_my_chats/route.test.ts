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

// Hoist mock functions
const mocks = vi.hoisted(() => {
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
      find: mocks.mockFind,
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
    mocks.mockLean.mockResolvedValue([{ _id: '1', title: 'Chat 1' }]);
    mocks.mockSort.mockReturnValue({ lean: mocks.mockLean });
    mocks.mockSelect.mockReturnValue({ sort: mocks.mockSort });

    // Default behavior for find: return object with select (and sort for backward compatibility if needed)
    mocks.mockFind.mockReturnValue({
        select: mocks.mockSelect, // For optimized path
        sort: mocks.mockSort      // For unoptimized path (direct find().sort())
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
  });

  it('should fetch chats scoped to user and optimized', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Verify user scoping
    expect(mocks.mockFind).toHaveBeenCalledWith({ userId: 'user123' });

    // Verify field selection (optimization)
    // We expect .select() to be called with at least 'title' and 'status' (string matching)
    expect(mocks.mockSelect).toHaveBeenCalled();
    const selectArg = mocks.mockSelect.mock.calls[0][0];
    expect(selectArg).toContain('title');
    expect(selectArg).toContain('status');

    // Verify sort
    expect(mocks.mockSort).toHaveBeenCalledWith({ updatedAt: -1 });

    // Verify lean (optimization)
    expect(mocks.mockLean).toHaveBeenCalled();
  });
});
