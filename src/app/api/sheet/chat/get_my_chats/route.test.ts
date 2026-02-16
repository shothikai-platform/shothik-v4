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

// Setup mocks using vi.hoisted to allow usage in vi.mock
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

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup generic mock chain
    // mockLean returns a resolved value (simulating await)
    mockLean.mockResolvedValue([{ _id: '1', title: 'Sheet Chat 1' }]);

    // mockSort returns an object with lean method
    mockSort.mockReturnValue({ lean: mockLean });

    // Default behavior for find: return object with sort
    mockFind.mockReturnValue({
        sort: mockSort
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    // Mock getAuthenticatedUser to return null
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
    expect(mockFind).not.toHaveBeenCalled();
  });

  it('should fetch chats filtered by user and use lean() for performance', async () => {
    const mockUser = { _id: 'user123', id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Verify authentication was checked
    expect(getAuthenticatedUser).toHaveBeenCalled();

    // Verify filtering by userId
    // Note: SheetSession uses userId as String, so we expect 'user123'
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });

    // Verify sorting
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });

    // Verify lean is called (Performance)
    expect(mockLean).toHaveBeenCalled();
  });
});
