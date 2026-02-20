import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import SheetSession from '@/models/SheetSession';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

// We need to mock the model module itself
vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      find: vi.fn(),
    },
  };
});

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  const mockUser = {
    _id: 'user123',
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    // Mock getAuthenticatedUser to return null
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should fetch chats for the authenticated user only and use optimization methods', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const userOnlyData = [{ _id: 'chat1', title: 'Chat 1', userId: 'user123' }];
    const allData = [
      { _id: 'chat1', title: 'Chat 1', userId: 'user123' },
      { _id: 'chat2', title: 'Chat 2', userId: 'otherUser' }
    ];

    // Create a mock query object that supports chaining
    const mockQuery: any = {
      sort: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(userOnlyData), // New implementation uses lean
    };

    // Make the query object thenable to support await in the old implementation
    // This simulates the behavior of returning all data if lean() is not called
    mockQuery.then = (resolve: any) => resolve(allData);

    (SheetSession.find as any).mockReturnValue(mockQuery);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(request);

    // Assert status is OK
    expect(response.status).toBe(200);

    // Verify that the correct Mongoose methods were called
    // These expectations verify the security and optimization fix:

    // 1. Security: Check that find was called with userId filter
    // If it was called with {}, it fails security check
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: mockUser._id });

    // 2. Optimization: Check that select was called to limit fields
    expect(mockQuery.select).toHaveBeenCalledWith('title status updatedAt createdAt');

    // 3. Optimization: Check that lean was called for performance
    expect(mockQuery.lean).toHaveBeenCalled();

    // 4. Correct sorting
    expect(mockQuery.sort).toHaveBeenCalledWith({ updatedAt: -1 });

    // 5. Check response mapping (title -> name)
    const data = await response.json();
    expect(data[0].name).toBe('Chat 1');
  });
});
