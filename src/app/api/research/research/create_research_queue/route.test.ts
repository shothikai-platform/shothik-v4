
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindById, mockFindOne, mockFindByIdAndUpdate, mockFindOneAndUpdate } = vi.hoisted(() => {
  return {
    mockFindById: vi.fn(),
    mockFindOne: vi.fn(),
    mockFindByIdAndUpdate: vi.fn(),
    mockFindOneAndUpdate: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findById: mockFindById,
      findOne: mockFindOne,
      findByIdAndUpdate: mockFindByIdAndUpdate,
      findOneAndUpdate: mockFindOneAndUpdate,
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: class {
    constructor(stream, options) {
        (this as any).stream = stream;
        (this as any).options = options;
        (this as any).status = options?.status || 200;
    }
    static json(data, options) {
      return { data, options, status: options?.status || 200 };
    }
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/research/research/create_research_queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
        method: 'POST',
        body: JSON.stringify({ chat: 'chat1', query: 'test query' })
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user (prevent IDOR)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

    // DB has a chat belonging to user1, so findOne with user2 will return null
    mockFindOne.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
        method: 'POST',
        body: JSON.stringify({ chat: 'chat1', query: 'test query' })
    });

    const response = await POST(request);

    expect(response.status).toBe(404);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat1', userId: 'user2' });
  });

  it('should return a stream if authorized', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    mockFindOne.mockResolvedValue({
        _id: 'chat1',
        userId: 'user1',
        messages: [],
        save: vi.fn().mockResolvedValue({})
    });

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
        method: 'POST',
        body: JSON.stringify({ chat: 'chat1', query: 'test query' })
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect((response as any).stream).toBeDefined();
  });
});
