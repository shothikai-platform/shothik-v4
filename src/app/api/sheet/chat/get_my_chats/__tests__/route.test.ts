import { test, expect, vi, describe, beforeEach } from 'vitest';
import { GET } from '../route';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn().mockResolvedValue(true)
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn()
}));

const mockSort = vi.fn().mockResolvedValue([]);
const mockFind = vi.fn().mockReturnValue({ sort: mockSort });

vi.mock('@/models/SheetSession', () => ({
  default: {
    find: (...args: any[]) => mockFind(...args)
  }
}));

const mockJson = vi.fn();
vi.mock('next/server', () => ({
  NextResponse: {
    json: (...args: any[]) => {
      mockJson(...args);
      return { status: args[1]?.status || 200, json: async () => args[0] };
    }
  }
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response: any = await GET(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
    expect(mockFind).not.toHaveBeenCalled();
  });

  test('should return chats filtered by user ID if authenticated', async () => {
    const mockUser = { _id: 'test-user-id' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockChats = [
      { _id: 'chat1', userId: 'test-user-id', updatedAt: new Date() },
      { _id: 'chat2', userId: 'test-user-id', updatedAt: new Date() }
    ];
    mockSort.mockResolvedValueOnce(mockChats);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response: any = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(mockFind).toHaveBeenCalledWith({ userId: 'test-user-id' });
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(data).toEqual(mockChats);
  });

  test('should use user.id if user._id is not available', async () => {
    const mockUser = { id: 'test-user-id-alt' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockSort.mockResolvedValueOnce([]);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    await GET(request);

    expect(mockFind).toHaveBeenCalledWith({ userId: 'test-user-id-alt' });
  });

  test('should return 500 on internal error', async () => {
    (getAuthenticatedUser as any).mockRejectedValue(new Error('Auth failed'));

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response: any = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Internal Server Error');
  });
});
