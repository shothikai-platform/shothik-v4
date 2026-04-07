
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
    body: any;

    constructor(body: any, options: any = {}) {
      this.body = body;
      this.status = options.status || 200;
      this.headers = options.headers || {};
    }

    static json(data: any, options: any = {}) {
      const res = new MockNextResponse(null, options);
      res.data = data;
      return res;
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

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat1', query: 'test query' }),
    });

    const response = (await POST(request)) as any;

    expect(response.status).toBe(401);
    expect(response.data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if chatId is missing', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ query: 'test query' }),
    });

    const response = (await POST(request)) as any;

    expect(response.status).toBe(400);
    expect(response.data.error).toContain('Invalid chat ID');
  });

  it('should return 400 if query is too long', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat1', query: 'a'.repeat(2001) }),
    });

    const response = (await POST(request)) as any;

    expect(response.status).toBe(400);
    expect(response.data.error).toContain('too long');
  });

  it('should return 404 if chat not found or not owned by user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOne.mockResolvedValue(null);

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat1', query: 'test query' }),
    });

    const response = (await POST(request)) as any;

    expect(response.status).toBe(404);
    expect(response.data.error).toBe('Chat not found');
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat1', userId: 'user1' });
  });

  it('should return 200 and a stream for a valid request by the owner', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    const mockChat = {
      messages: [],
      save: mockSave.mockResolvedValue(true),
    };
    mockFindOne.mockResolvedValue(mockChat);

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat1', query: 'test query' }),
    });

    const response = (await POST(request)) as any;

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(ReadableStream);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat1', userId: 'user1' });
    expect(mockChat.messages.length).toBe(1);
    expect(mockSave).toHaveBeenCalled();
  });
});
