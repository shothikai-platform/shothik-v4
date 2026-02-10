
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

const { mockFindById, mockFindOne } = vi.hoisted(() => {
  return {
    mockFindById: vi.fn(),
    mockFindOne: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findById: mockFindById,
      findOne: mockFindOne,
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
import ResearchChat from '@/models/ResearchChat';

describe('GET /api/research/chat/get_one_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    // Even if findOne is mocked to return something, auth check happens first.
    // But we need to mock findOne to avoid "lean is not a function" error if it gets called.
    // However, if auth fails, findOne shouldn't be called.

    const response = await GET(
        new Request('http://localhost/api/research/chat/get_one_chat/chat1'),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(401);
    expect(mockFindOne).not.toHaveBeenCalled();
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

    // Mock findOne chain with .lean() returning null (chat not found for this user)
    const mockLean = vi.fn().mockResolvedValue(null);
    mockFindOne.mockReturnValue({ lean: mockLean });

    const response = await GET(
        new Request('http://localhost/api/research/chat/get_one_chat/chat1'),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(404);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat1', userId: 'user2' });
    expect(mockLean).toHaveBeenCalled();
  });

  it('should return the chat if found and owned by user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const mockChat = { _id: 'chat1', userId: 'user1', name: 'Chat 1' };

    // Mock findOne chain with .lean() returning the chat
    const mockLean = vi.fn().mockResolvedValue(mockChat);
    mockFindOne.mockReturnValue({ lean: mockLean });

    const response = await GET(
        new Request('http://localhost/api/research/chat/get_one_chat/chat1'),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockChat);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat1', userId: 'user1' });
    expect(mockLean).toHaveBeenCalled();
  });
});
