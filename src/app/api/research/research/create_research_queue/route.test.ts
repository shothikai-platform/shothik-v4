
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

const { mockFindById, mockFindOne, mockFindByIdAndUpdate } = vi.hoisted(() => {
  return {
    mockFindById: vi.fn(),
    mockFindOne: vi.fn(),
    mockFindByIdAndUpdate: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findById: mockFindById,
      findOne: mockFindOne,
      findByIdAndUpdate: mockFindByIdAndUpdate,
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: class {
    static json(data: any, options: any) {
      return { data, options, status: options?.status || 200 };
    }
    constructor(body: any, init: any) {
        return { body, init, status: init?.status || 200 } as any;
    }
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';

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

    const response: any = await POST(request);

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

    // Mock findById to return a chat belonging to user1 (for current insecure version)
    mockFindById.mockResolvedValue({
        _id: 'chat1',
        userId: 'user1',
        messages: { push: vi.fn() },
        save: vi.fn().mockResolvedValue({})
    });

    // Mock findOne to return null (for future secure version)
    mockFindOne.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
        method: 'POST',
        body: JSON.stringify({ chat: 'chat1', query: 'test query' })
    });

    const response: any = await POST(request);

    expect(response.status).toBe(404);
  });
});
