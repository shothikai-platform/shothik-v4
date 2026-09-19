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
  class MockNextResponse {
    stream: any;
    options: any;
    status: number;
    constructor(stream: any, options?: any) {
      this.stream = stream;
      this.options = options;
      this.status = options?.status || 200;
    }
    static json(data: any, options?: any) {
      return { data, options, status: options?.status || 200 };
    }
  }
  return {
    NextResponse: MockNextResponse,
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
      body: JSON.stringify({ chat: 'chat1', query: 'quantum computing' }),
    });

    const response: any = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user (IDOR protection)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOne.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat1', query: 'quantum computing' }),
    });

    const response: any = await POST(request);
    expect(response.status).toBe(404);
  });

  it('should return 200 stream response if chat belongs to authenticated user', async () => {
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
      body: JSON.stringify({ chat: 'chat1', query: 'quantum computing' }),
    });

    const response: any = await POST(request);
    expect(response.status).toBe(200);
    expect(mockChat.save).toHaveBeenCalled();
  });
});
