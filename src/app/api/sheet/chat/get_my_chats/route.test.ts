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

// Mock Mongoose model methods
const { mockSort, mockFind } = vi.hoisted(() => {
  const mockSort = vi.fn();
  return {
    mockSort,
    mockFind: vi.fn().mockReturnValue({
      sort: mockSort,
    }),
  };
});

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
    // Simulate no authenticated user
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Unauthorized' },
      { status: 401 }
    );
    // Ensure database isn't queried
    expect(SheetSession.find).not.toHaveBeenCalled();
  });

  it('should return user sessions successfully when authenticated', async () => {
    const mockUser = { _id: 'user123', email: 'test@example.com' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSessions = [
      { _id: 'session1', title: 'Sheet 1', userId: 'user123' },
      { _id: 'session2', title: 'Sheet 2', userId: 'user123' }
    ];

    mockSort.mockResolvedValue(mockSessions);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(200);
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user123' });
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(NextResponse.json).toHaveBeenCalledWith(mockSessions);
  });
});
