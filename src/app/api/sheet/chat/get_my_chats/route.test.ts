import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import SheetSession from '@/models/SheetSession';
import * as serverAuth from '@/lib/server-auth';
import { NextResponse } from 'next/server';

// Mock dependencies
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

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return sessions filtered by userId for authenticated user', async () => {
    // Mock user
    const mockUser = { _id: 'user-123', email: 'test@example.com' };
    vi.spyOn(serverAuth, 'getAuthenticatedUser').mockResolvedValue(mockUser);

    // Mock find implementation
    const mockLean = vi.fn().mockResolvedValue([
      { _id: 'session-1', userId: 'user-123', title: 'My Session' }
    ]);
    const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
    const mockFind = vi.fn().mockReturnValue({ sort: mockSort });

    // Setup SheetSession.find mock
    (SheetSession.find as any).mockImplementation(mockFind);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(request);

    expect(response).toBeInstanceOf(NextResponse);
    const json = await response.json();

    // Verify security: filtered by userId
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user-123' });
    expect(json).toHaveLength(1);
    expect(json[0].userId).toBe('user-123');
  });

  it('should return empty list if not authenticated (safe failure)', async () => {
    // Mock NO user
    vi.spyOn(serverAuth, 'getAuthenticatedUser').mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/chat/get_my_chats');
    const response = await GET(request);

    // Verify security: returns empty list instead of 401 or exposing data
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual([]);

    // Verify database was NOT accessed
    expect(SheetSession.find).not.toHaveBeenCalled();
  });
});
