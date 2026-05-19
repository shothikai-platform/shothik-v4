
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

const { mockFindById, mockFindOne, mockFindByIdAndUpdate, mockSave } = vi.hoisted(() => {
  return {
    mockFindById: vi.fn(),
    mockFindOne: vi.fn(),
    mockFindByIdAndUpdate: vi.fn(),
    mockSave: vi.fn(),
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
vi.mock('next/server', () => {
    const json = vi.fn((data, options) => ({
        data,
        options,
        status: options?.status || 200,
        json: async () => data,
    }));
    return {
        NextResponse: class {
            constructor(body, init) {
                this.body = body;
                this.status = init?.status || 200;
                this.headers = init?.headers;
            }
            static json = json;
        }
    };
});

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/research/research/create_research_queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const req = new Request('http://localhost/api/research/research/create_research_queue', {
        method: 'POST',
        body: JSON.stringify({ chat: 'chat1', query: 'test query' }),
    });

    const response = await POST(req);

    // Current behavior: 200 or 404/500 depending on DB
    // Desired behavior: 401
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // Mock that findOne returns null for this user
    mockFindOne.mockResolvedValue(null);
    // Even if findById would have found it
    mockFindById.mockResolvedValue({ _id: 'chat1', userId: 'user2' });

    const req = new Request('http://localhost/api/research/research/create_research_queue', {
        method: 'POST',
        body: JSON.stringify({ chat: 'chat1', query: 'test query' }),
    });

    const response = await POST(req);

    // Current behavior: 200 (if it uses findById and ignores ownership)
    // Desired behavior: 404
    expect(response.status).toBe(404);
  });

  it('should return 400 if query is too long', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const longQuery = 'a'.repeat(5001);
    const req = new Request('http://localhost/api/research/research/create_research_queue', {
        method: 'POST',
        body: JSON.stringify({ chat: 'chat1', query: longQuery }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});
