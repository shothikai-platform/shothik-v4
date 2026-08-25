import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

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

vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findOne: mockFindOne,
      findOneAndUpdate: mockFindOneAndUpdate,
    },
  };
});

vi.mock('next/server', () => {
  return {
    NextResponse: class MockNextResponse {
      body: any;
      headers: any;
      status: number;
      static json(data: any, options?: any) {
        return { data, status: options?.status || 200 };
      }
      constructor(body: any, options?: any) {
        this.body = body;
        this.headers = options?.headers;
        this.status = options?.status || 200;
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
      body: JSON.stringify({ chat: 'chat1', query: 'test query' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
    expect((response as any).data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 404 if chat belongs to another user or does not exist', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOne.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat2', query: 'test query' }),
    });

    const response = await POST(request);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat2', userId: 'user1' });
    expect(response.status).toBe(404);
    expect((response as any).data).toEqual({ error: 'Chat not found' });
  });

  it('should return 200 streaming response if authenticated user owns the chat', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    const mockChat = {
      _id: 'chat1',
      userId: 'user1',
      messages: [],
      save: vi.fn().mockResolvedValue(true),
    };
    mockFindOne.mockResolvedValue(mockChat);

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat1', query: 'test query' }),
    });

    const response = await POST(request);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat1', userId: 'user1' });
    expect(response.status).toBe(200);
    expect(mockChat.messages.length).toBe(1);
    expect(mockChat.messages[0].content).toBe('test query');
  });
});
