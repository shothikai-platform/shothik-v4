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

const { mockFindById, mockFindByIdAndUpdate, mockFindOne, mockFindOneAndUpdate, mockSave } = vi.hoisted(() => {
  return {
    mockFindById: vi.fn(),
    mockFindByIdAndUpdate: vi.fn(),
    mockFindOne: vi.fn(),
    mockFindOneAndUpdate: vi.fn(),
    mockSave: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findById: mockFindById,
      findByIdAndUpdate: mockFindByIdAndUpdate,
      findOne: mockFindOne,
      findOneAndUpdate: mockFindOneAndUpdate,
    },
  };
});

// Mock NextResponse - use vi.hoisted to ensure it's available
const { MockNextResponse } = vi.hoisted(() => {
  class MockResponse {
    status: number;
    body: any;
    headers: any;
    constructor(body: any, init?: any) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Map(Object.entries(init?.headers || {}));
    }
    static json(data: any, init?: any) {
      return { data, status: init?.status || 200, json: () => Promise.resolve(data) };
    }
  }
  return { MockNextResponse: MockResponse };
});

vi.mock('next/server', () => ({
  NextResponse: MockNextResponse,
}));

import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';

describe('POST /api/research/research/create_research_queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat1', query: 'test' })
        })
    );

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

    // Insecure version uses findById
    mockFindById.mockResolvedValue({ _id: 'chat1', userId: 'user1', messages: [], save: mockSave });

    const response = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat1', query: 'test' })
        })
    );

    expect(response.status).toBe(404);
  });
});
