
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
      findByIdAndUpdate: vi.fn(),
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: class {
    constructor(body: any, init?: any) {
        this.body = body;
        this.status = init?.status || 200;
        this.headers = new Headers(init?.headers);
    }
    static json(data: any, options?: any) {
      return { data, options, status: options?.status || 200 };
    }
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';

describe('POST /api/research/research/create_research_queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated (Security Fix Verification)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response: any = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat1', query: 'test' })
        })
    );

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user (Security Fix Verification)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

    mockFindOne.mockResolvedValue(null);
    mockFindById.mockResolvedValue({ _id: 'chat1', userId: 'user1', messages: [], save: vi.fn() });

    const response: any = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat1', query: 'test' })
        })
    );

    expect(response.status).toBe(404);
  });
});
