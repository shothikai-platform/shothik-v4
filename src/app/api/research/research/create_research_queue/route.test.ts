
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

const { mockFindOne, mockFindOneAndUpdate, mockSave } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockFindOneAndUpdate: vi.fn(),
    mockSave: vi.fn(),
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
    status: number;
    data: any;
    headers: any;
    constructor(body?: any, init?: any) {
      this.data = body;
      this.status = init?.status || 200;
      this.headers = init?.headers || {};
    }
    static json(data: any, init?: any) {
      return { data, status: init?.status || 200 };
    }
  }
  return {
    NextResponse: MockNextResponse,
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

    const response = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat1', query: 'test' })
    }));

    expect(response.status).toBe(401);
  });

  it('should return 400 if chatId or query is missing', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const response = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ query: 'test' })
    }));

    expect(response.status).toBe(400);
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOne.mockResolvedValue(null);

    const response = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat2', query: 'test' })
    }));

    expect(response.status).toBe(404);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat2', userId: 'user1' });
  });

  it('should start research if authorized', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    const mockChat = {
        _id: 'chat1',
        userId: 'user1',
        messages: [],
        save: mockSave
    };
    mockFindOne.mockResolvedValue(mockChat);

    const response = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat1', query: 'test' })
    }));

    expect(response.status).toBe(200);
    expect(mockSave).toHaveBeenCalled();
  });
});
