import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

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

vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findById: mockFindById,
      findOne: mockFindOne,
    },
  };
});

vi.mock('next/server', () => {
  return {
    NextResponse: class MockNextResponse {
      body: any;
      init: any;
      status: number;
      constructor(body: any, init?: any) {
        this.body = body;
        this.init = init;
        this.status = init?.status || 200;
      }
      static json(data: any, options?: any) {
        return { data, options, status: options?.status || 200 };
      }
    },
  };
});

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/research/research/create_research_queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat123', query: 'test query' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat is not found or does not belong to user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    mockFindOne.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat123', query: 'test query' }),
    });

    const response = await POST(request);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });
    expect(response.status).toBe(404);
  });

  it('should return 200 stream response if chat belongs to user', async () => {
    const mockChat = {
      _id: 'chat123',
      userId: 'user123',
      messages: [],
      save: vi.fn().mockResolvedValue(true),
    };

    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    mockFindOne.mockResolvedValue(mockChat);

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat123', query: 'test query' }),
    });

    const response = await POST(request);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });
    expect(response.status).toBe(200);
  });
});
