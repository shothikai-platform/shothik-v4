
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

const { mockFind, mockSort, mockJson } = vi.hoisted(() => {
  const sortFn = vi.fn();
  const findFn = vi.fn(() => ({
    sort: sortFn,
  }));
  const jsonFn = vi.fn((data, options) => ({
    data,
    status: options?.status || 200,
    json: async () => data,
  }));
  return {
    mockFind: findFn,
    mockSort: sortFn,
    mockJson: jsonFn,
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
    json: mockJson,
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
  });

  it('should return 200 and user sessions if authenticated', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSessions = [{ _id: 'session1', userId: 'user123' }];
    mockSort.mockResolvedValue(mockSessions);
    mockFind.mockReturnValue({
        sort: mockSort
    });

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(200);
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user123' });
    const data = await (response as any).json();
    expect(data).toEqual(mockSessions);
  });
});
