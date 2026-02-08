import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';
import SheetSession from '@/models/SheetSession';
import { getAuthenticatedUser } from '@/lib/server-auth';
import dbConnect from '@/lib/dbConnect';

// Mock dependencies
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
    })),
  },
}));

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 Unauthorized if user is not authenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  });

  it('should return user chats if authenticated', async () => {
    const mockUser = { _id: 'user123', name: 'Test User', email: 'test@example.com' };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser);

    const mockSessions = [{ _id: 'session1', title: 'Test Session' }];
    const mockFindChain = {
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockSessions),
    };

    // Setup find to return the chain object
    vi.mocked(SheetSession.find).mockReturnValue(mockFindChain as any);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(request);

    expect(response.status).toBe(200);
    // This assertion verifies the security fix: filtering by userId
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: mockUser._id });
    expect(mockFindChain.sort).toHaveBeenCalledWith({ updatedAt: -1 });
    // This assertion verifies the performance fix: using lean()
    expect(mockFindChain.lean).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(mockSessions);
  });

  it('should handle errors gracefully', async () => {
     const mockUser = { _id: 'user123', name: 'Test User', email: 'test@example.com' };
     vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser);

     vi.mocked(SheetSession.find).mockImplementation(() => {
         throw new Error('Database error');
     });

     const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
     const response = await GET(request);

     expect(response.status).toBe(500);
  });
});
