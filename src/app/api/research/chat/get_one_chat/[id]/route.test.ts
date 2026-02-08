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

const { mockFindOne } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
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

describe('GET /api/research/chat/get_one_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(
        new Request('http://localhost/api/research/chat/get_one_chat/chat1'),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user', async () => {
    const mockUser = { _id: 'user2' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Mock findOne to return null when searching for chat1 for user2
    mockFindOne.mockResolvedValue(null);

    const response = await GET(
        new Request('http://localhost/api/research/chat/get_one_chat/chat1'),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(404);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat1', userId: mockUser._id });
  });

  it('should return 200 and the chat if authenticated and authorized', async () => {
    const mockUser = { _id: 'user1' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    const mockChat = { _id: 'chat1', userId: 'user1', name: 'Chat 1' };
    mockFindOne.mockResolvedValue(mockChat);

    const response = await GET(
        new Request('http://localhost/api/research/chat/get_one_chat/chat1'),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(200);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat1', userId: mockUser._id });
  });
});
