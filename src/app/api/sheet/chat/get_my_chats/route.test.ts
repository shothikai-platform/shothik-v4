import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';
import SheetSession from '@/models/SheetSession';
import { getAuthenticatedUser } from '@/lib/server-auth';
import dbConnect from '@/lib/dbConnect';

// Mock dependencies
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn((data, options) => ({
        body: data,
        status: options?.status || 200,
      })),
    },
  };
});

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => ({
  default: {
    find: vi.fn(),
  },
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  const mockRequest = new Request('http://localhost:3000/api/sheet/chat/get_my_chats');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 Unauthorized if user is not authenticated', async () => {
    // Arrange: Mock unauthenticated user
    (getAuthenticatedUser as any).mockResolvedValue(null);

    // Act
    const response = await GET(mockRequest);

    // Assert
    expect(response.status).toBe(401);
    expect((response as any).body).toEqual({ error: 'Unauthorized' });
    expect(dbConnect).not.toHaveBeenCalled();
    expect(SheetSession.find).not.toHaveBeenCalled();
  });

  it('should prevent IDOR by scoping query to authenticated user ID', async () => {
    // Arrange: Mock authenticated user
    const mockUser = { _id: 'user-123', email: 'test@example.com' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSessions = [{ _id: 'session-1', title: 'Test' }];
    const mockLean = vi.fn().mockResolvedValue(mockSessions);
    const mockSort = vi.fn().mockReturnValue({ lean: mockLean });

    (SheetSession.find as any).mockReturnValue({
      sort: mockSort,
    });

    // Act
    const response = await GET(mockRequest);

    // Assert
    expect(response.status).toBe(200);
    expect((response as any).body).toEqual(mockSessions);
    expect(dbConnect).toHaveBeenCalled();

    // Crucial security assertion: verify the query is filtered by userId
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: mockUser._id });
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();
  });

  it('should gracefully handle database errors', async () => {
    // Arrange: Mock authenticated user
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user-123' });

    // Arrange: Mock database failure
    (dbConnect as any).mockRejectedValue(new Error('DB Error'));

    // Act
    const response = await GET(mockRequest);

    // Assert
    expect(response.status).toBe(500);
    expect((response as any).body).toEqual({ error: 'Internal Server Error' });
  });
});
