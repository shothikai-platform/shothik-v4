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
      findById: vi.fn(), // We expect this to NOT be used after fix
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

    const params = Promise.resolve({ id: 'chat123' });
    const response = await GET(new Request('http://localhost/api/research/chat/get_one_chat/chat123'), { params });

    expect(response.status).toBe(401);
  });

  it('should fetch chat if it belongs to user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockFindOne.mockResolvedValue({ _id: 'chat123', userId: 'user123' });

    const params = Promise.resolve({ id: 'chat123' });
    const response = await GET(new Request('http://localhost/api/research/chat/get_one_chat/chat123'), { params });

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });
    expect(response.status).toBe(200);
  });

  it('should return 404 if chat not found or not owned by user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockFindOne.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'chat123' });
    const response = await GET(new Request('http://localhost/api/research/chat/get_one_chat/chat123'), { params });

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });
    expect(response.status).toBe(404);
  });
});
