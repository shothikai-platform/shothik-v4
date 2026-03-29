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

// Hoisted mocks for Mongoose chaining
const { mockFind, mockSort, mockLean } = vi.hoisted(() => {
  const leanMock = vi.fn();
  const sortMock = vi.fn().mockReturnValue({ lean: leanMock });
  const findMock = vi.fn().mockReturnValue({ sort: sortMock });
  return {
    mockFind: findMock,
    mockSort: sortMock,
    mockLean: leanMock,
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
const { mockJson } = vi.hoisted(() => {
  return {
    mockJson: vi.fn((data, options) => {
      return {
        data,
        options,
        status: options?.status || 200,
        json: async () => data,
      };
    }),
  };
});

vi.mock('next/server', () => ({
  NextResponse: {
    json: mockJson,
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
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });

  it('should return user sessions successfully and map _id to id', async () => {
    const mockUser = { _id: 'user123', email: 'test@example.com' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSessions = [
      { _id: 'session1', userId: 'user123', title: 'Chat 1' },
      { _id: 'session2', userId: 'user123', title: 'Chat 2' },
    ];

    mockLean.mockResolvedValue(mockSessions);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(200);
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });

    const data = await response.json();
    expect(data).toHaveLength(2);
    expect(data[0]).toHaveProperty('id', 'session1');
    expect(data[0]).toHaveProperty('_id', 'session1');
    expect(data[0]).toHaveProperty('title', 'Chat 1');
    expect(data[1]).toHaveProperty('id', 'session2');
  });

  it('should handle fallback to user.id if user._id is not available', async () => {
    const mockUser = { id: 'user456', email: 'test2@example.com' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockLean.mockResolvedValue([]);

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(mockFind).toHaveBeenCalledWith({ userId: 'user456' });
  });

  it('should return 500 on database error', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    mockFind.mockImplementationOnce(() => {
      throw new Error('Database connection failed');
    });

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Internal Server Error' });
  });
});
