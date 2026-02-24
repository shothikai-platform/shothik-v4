import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      find: vi.fn(),
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

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);
    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(response.data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 200 and filtered chats for authenticated user', async () => {
    const mockUser = { _id: 'user123', id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockChats = [
      { _id: 'chat1', title: 'Chat 1', createdAt: new Date(), updatedAt: new Date() },
      { _id: 'chat2', title: 'Chat 2', createdAt: new Date(), updatedAt: new Date() },
    ];

    // Mock chainable Mongoose methods
    const mockSort = vi.fn().mockReturnThis();
    const mockSelect = vi.fn().mockReturnThis();
    const mockLean = vi.fn().mockResolvedValue(mockChats);

    (SheetSession.find as any).mockReturnValue({
      select: mockSelect,
      sort: mockSort,
      lean: mockLean,
    });
    // For the current unoptimized implementation, find().sort() is called, so we need to support that too
    // But since I am writing the test for the *optimized* version, I'll focus on that structure.
    // However, the current code is `find({}).sort(...)`.
    // The test will likely fail because the current code doesn't call select() or lean().

    // To make the mock robust for both current and future implementation (so I can verify the failure properly):
    const mockQuery = {
      sort: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockChats),
      // If current implementation just awaits sort(), it will return the mockQuery object which isn't array-like directly unless awaited?
      // Mongoose queries are thenables.
      then: (resolve: any) => resolve(mockChats)
    };
    (SheetSession.find as any).mockReturnValue(mockQuery);


    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(request);

    // Verify it returns 200
    expect(response.status).toBe(200);

    // Verify data transformation (title -> name)
    // The optimized version should return objects with `name`.
    // The test expects the *final* optimized output.
    expect(response.data).toHaveLength(2);
    expect(response.data[0]).toHaveProperty('name', 'Chat 1');
    expect(response.data[1]).toHaveProperty('name', 'Chat 2');

    // Verify query scoping
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: mockUser._id });
  });
});
