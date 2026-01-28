
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

const { mockFindOne, mockFindById } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockFindById: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findOne: mockFindOne,
      findById: mockFindById,
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
  const mockParams = Promise.resolve({ id: 'chat123' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(
      new Request('http://localhost/api/research/chat/get_one_chat/chat123'),
      { params: mockParams }
    );

    expect(response.status).toBe(401);
  });

  it('should fetch chat with ownership verification', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockChat = { _id: 'chat123', userId: 'user123', title: 'My Chat' };
    mockFindOne.mockResolvedValue(mockChat);

    const response = await GET(
      new Request('http://localhost/api/research/chat/get_one_chat/chat123'),
      { params: mockParams }
    );

    // Verify correct query using ID and UserID (IDOR protection)
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });

    // Verify response data
    expect(response.data).toEqual(mockChat);
  });

  it('should return 404 if chat is not found or does not belong to user', async () => {
     const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockFindOne.mockResolvedValue(null);

    const response = await GET(
      new Request('http://localhost/api/research/chat/get_one_chat/chat123'),
      { params: mockParams }
    );

    expect(response.status).toBe(404);
  });
});
