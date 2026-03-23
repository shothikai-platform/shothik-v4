import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import dbConnect from '@/lib/dbConnect';
import SheetSession from '@/models/SheetSession';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

// Hoist mock functions for Mongoose chain so they are defined before the module is mocked
const { mockSort, mockLean, mockFind, mockJson } = vi.hoisted(() => {
  const mockJson = vi.fn((data, options) => ({
    json: async () => data,
    status: options?.status || 200,
  }));
  const mockLean = vi.fn();
  const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
  const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
  return { mockSort, mockLean, mockFind, mockJson };
});

// Mock Next.js NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: mockJson,
  },
}));

vi.mock('@/models/SheetSession', () => ({
  default: {
    find: mockFind,
  },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  const mockRequest = {} as Request;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 500 if an error occurs', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ id: 'user123' });
    (dbConnect as any).mockRejectedValueOnce(new Error('DB Error'));

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal Server Error');
  });

  it('should fetch and return chats mapped with id when authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ id: 'user123', _id: 'user123' });
    (dbConnect as any).mockResolvedValueOnce(true);

    const mockChats = [
      { _id: 'chat1', title: 'Chat 1', userId: 'user123' },
      { _id: 'chat2', title: 'Chat 2', userId: 'user123' }
    ];

    mockLean.mockResolvedValue(mockChats);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(getAuthenticatedUser).toHaveBeenCalled();
    expect(dbConnect).toHaveBeenCalled();
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user123' });
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0].id).toBe('chat1');
    expect(data[0]._id).toBe('chat1');
    expect(data[1].id).toBe('chat2');
  });
});
