import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';
import dbConnect from '@/lib/dbConnect';

// Mock dependencies
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => ({
  default: {
    find: vi.fn(),
  },
}));

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  const mockRequest = {} as Request;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    // Arrange
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    // Act
    const response = await GET(mockRequest);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(getAuthenticatedUser).toHaveBeenCalledTimes(1);
    expect(dbConnect).not.toHaveBeenCalled();
    expect(SheetSession.find).not.toHaveBeenCalled();
  });

  it('should return 200 and user sessions if user is authenticated', async () => {
    // Arrange
    const mockUser = { _id: 'user123', name: 'Test User', email: 'test@example.com' };
    const mockSessions = [
      { _id: 'session1', title: 'Chat 1' },
      { _id: 'session2', title: 'Chat 2' },
    ];

    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser);

    // Mock chained find().sort()
    const mockSort = vi.fn().mockResolvedValue(mockSessions);
    vi.mocked(SheetSession.find).mockReturnValue({ sort: mockSort } as any);

    // Act
    const response = await GET(mockRequest);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual(mockSessions);
    expect(getAuthenticatedUser).toHaveBeenCalledTimes(1);
    expect(dbConnect).toHaveBeenCalledTimes(1);

    // Ensure we are filtering by the authenticated user's ID
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: mockUser._id });
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
  });

  it('should return 500 on database error', async () => {
    // Arrange
    const mockUser = { _id: 'user123', name: 'Test User', email: 'test@example.com' };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser);

    vi.mocked(dbConnect).mockRejectedValue(new Error('Database connection failed'));

    // Act
    const response = await GET(mockRequest);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal Server Error' });
  });
});
