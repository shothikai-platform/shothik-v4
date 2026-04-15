
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFind } = vi.hoisted(() => {
  return {
    mockFind: vi.fn(),
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
    json: vi.fn((data, options) => ({
        data,
        options,
        status: options?.status || 200,
        json: async () => data
    })),
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFind.mockReturnValue({
        sort: vi.fn().mockResolvedValue([
            { _id: 'session1', userId: 'user1', title: 'Session 1' },
            { _id: 'session2', userId: 'user2', title: 'Session 2' }
        ])
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Desired behavior: 401 (Unauthorized)
    // Current behavior: 200 (returns all sessions)
    expect(response.status).toBe(401);
  });

  it('should only return sessions belonging to the authenticated user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Desired behavior: find called with { userId: 'user1' }
    // Current behavior: find called with {}
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user1' });
  });
});
