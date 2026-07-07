
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
vi.mock('next/server', () => ({
  NextResponse: class {
    constructor(stream: any, options: any) {
        (this as any).stream = stream;
        (this as any).options = options;
        (this as any).status = options?.status || 200;
    }
    static json(data: any, options: any) {
      return {
        json: async () => data,
        status: options?.status || 200
      };
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
    mockFindById.mockResolvedValue({ _id: 'chat1', userId: 'user1', messages: [], save: mockSave });

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat1', query: 'test query' }),
    });

    const response = await POST(request);

    // Current behavior: 200 (starts research even without auth because it finds the chat by ID)
    // Desired behavior: 401 (Unauthorized)
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user (IDOR)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

    // In secure version we use findOne with userId.
    // Here we simulate findOne returning null for the wrong user.
    mockFindOne.mockResolvedValue(null);

    // In insecure version, findById might return the chat
    mockFindById.mockResolvedValue({ _id: 'chat1', userId: 'user1', messages: [], save: mockSave });

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat1', query: 'test query' }),
    });

    const response = await POST(request);

    // Current behavior: 200 (starts research because it finds the chat by ID)
    // Desired behavior: 404 (Not Found)
    expect(response.status).toBe(404);
  });
});
