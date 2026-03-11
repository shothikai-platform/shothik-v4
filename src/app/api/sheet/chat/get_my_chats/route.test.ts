import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';
import SheetSession from '@/models/SheetSession';
import { getAuthenticatedUser } from '@/lib/server-auth';
import dbConnect from '@/lib/dbConnect';

// Mock dependencies
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => {
  const leanMock = vi.fn();
  const sortMock = vi.fn().mockReturnValue({ lean: leanMock });
  const findMock = vi.fn().mockReturnValue({ sort: sortMock });

  return {
    default: {
      find: findMock,
    },
  };
});

// Create a helper to access the mocked methods for assertions
const getMockedMethods = () => {
  const findMock = SheetSession.find as unknown as ReturnType<typeof vi.fn>;
  const sortMock = findMock().sort as unknown as ReturnType<typeof vi.fn>;
  const leanMock = sortMock().lean as unknown as ReturnType<typeof vi.fn>;
  return { findMock, sortMock, leanMock };
};

describe('GET /api/sheet/chat/get_my_chats', () => {
  const mockRequest = new Request('http://localhost/api/sheet/chat/get_my_chats');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    // Mock unauthenticated user
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(mockRequest);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data).toEqual({ error: 'Unauthorized' });

    // Ensure DB connect and query were not called
    expect(dbConnect).not.toHaveBeenCalled();
    expect(SheetSession.find).not.toHaveBeenCalled();
  });

  it('should return user sessions successfully', async () => {
    // Mock authenticated user
    const mockUser = { _id: 'user123', email: 'test@example.com' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Mock DB operations
    const mockSessions = [
      { _id: 'session1', title: 'Chat 1' },
      { _id: 'session2', title: 'Chat 2' }
    ];

    const { findMock, sortMock, leanMock } = getMockedMethods();
    leanMock.mockResolvedValueOnce(mockSessions);

    const response = await GET(mockRequest);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual(mockSessions);

    // Verify DB connect and query
    expect(dbConnect).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith({ userId: mockUser._id });
    expect(sortMock).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(leanMock).toHaveBeenCalledTimes(1);
  });

  it('should handle missing _id and fallback to id for user', async () => {
    // Mock authenticated user without _id but with id
    const mockUser = { id: 'user456', email: 'test2@example.com' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const { findMock, sortMock, leanMock } = getMockedMethods();
    leanMock.mockResolvedValueOnce([]);

    await GET(mockRequest);

    // Verify DB query used fallback id
    expect(findMock).toHaveBeenCalledWith({ userId: mockUser.id });
  });

  it('should return 500 on internal server error', async () => {
    // Mock authenticated user
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    // Mock DB error
    const { findMock } = getMockedMethods();
    findMock.mockImplementationOnce(() => {
      throw new Error('Database connection failed');
    });

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await GET(mockRequest);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data).toEqual({ error: 'Internal Server Error' });

    consoleSpy.mockRestore();
  });
});
