
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
vi.mock('next/server', () => {
    class MockNextResponse extends Response {
        static json(data: any, options: any = {}) {
            const res = new MockNextResponse(JSON.stringify(data), options);
            (res as any).json = async () => data;
            return res;
        }
    }
    return {
        NextResponse: MockNextResponse
    };
});

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
      body: JSON.stringify({ chat: 'chat1', query: 'test query' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    // Simulate chat belonging to user2 (findOne returns null when filtering by userId)
    mockFindOne.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat1', query: 'test query' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);
  });

  it('should return 400 if query is missing', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat1' }), // Missing query
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
