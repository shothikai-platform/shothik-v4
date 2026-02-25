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

const { mockFind, mockSort, mockSelect, mockLean } = vi.hoisted(() => {
  const mockLean = vi.fn();
  const mockSelect = vi.fn(() => ({ lean: mockLean }));
  const mockSort = vi.fn(() => ({ select: mockSelect, lean: mockLean })); // Allow chain with or without select
  const mockFind = vi.fn(() => ({ sort: mockSort }));
  return { mockFind, mockSort, mockSelect, mockLean };
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
import SheetSession from '@/models/SheetSession';

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // This assertion will FAIL initially because the current implementation doesn't check auth
    // But this confirms the test setup works and reproduces the "issue" (lack of auth)
    // After fix, this should pass with status 401.
    // For now, let's assert what we expect AFTER the fix, so the test fails first (TDD).
    expect(response.status).toBe(401);
  });

  it('should fetch chats for the authenticated user only', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockChats = [{ title: 'Chat 1' }, { title: 'Chat 2' }];
    mockLean.mockResolvedValue(mockChats);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(200);

    // Check that find was called with the correct user ID
    expect(mockFind).toHaveBeenCalledWith({ userId: mockUser._id });

    // Check that select was called to optimize fields
    expect(mockSelect).toHaveBeenCalledWith('title status updatedAt');

    // Check that lean was called
    expect(mockLean).toHaveBeenCalled();
  });
});
