import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

const { mockFind, mockSort } = vi.hoisted(() => {
  const mockSort = vi.fn();
  const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
  return { mockFind, mockSort };
});

vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      find: mockFind,
    },
  };
});

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
    expect((response as any).data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 200 and only the user sessions if user is authenticated', async () => {
    const mockUser = { _id: 'user123', email: 'test@example.com' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSessions = [{ _id: 'session1', title: 'Test Session' }];
    mockSort.mockResolvedValue(mockSessions);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(200);
    expect((response as any).data).toEqual(mockSessions);
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
  });
});
