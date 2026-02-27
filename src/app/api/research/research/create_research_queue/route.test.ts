
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

const { mockFindOne, mockFindOneAndUpdate } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockFindOneAndUpdate: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findOne: mockFindOne,
      findOneAndUpdate: mockFindOneAndUpdate,
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => {
    class MockNextResponse {
        body: any;
        status: number;
        headers: Headers;
        constructor(body: any, init?: any) {
            this.body = body;
            this.status = init?.status || 200;
            this.headers = new Headers(init?.headers);
        }
        static json = vi.fn((data, options) => ({
            data,
            options,
            status: options?.status || 200,
        }));
    }
    return { NextResponse: MockNextResponse };
});

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/research/research/create_research_queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await POST(new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ chat: 'chat1', query: 'test' })
    }));

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });
    mockFindOne.mockResolvedValue(null);

    const response = await POST(new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ chat: 'chat1', query: 'test' })
    }));

    expect(response.status).toBe(404);
  });

  it('should return 200 stream if ownership is verified', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    const mockChat = {
        _id: 'chat1',
        userId: 'user1',
        messages: {
            push: vi.fn()
        },
        save: vi.fn().mockResolvedValue(true)
    };
    mockFindOne.mockResolvedValue(mockChat);

    const response = await POST(new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ chat: 'chat1', query: 'test' })
    }));

    expect(response.status).toBe(200);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat1', userId: 'user1' });
  });
});
