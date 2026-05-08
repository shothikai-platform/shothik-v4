import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindOne, mockFindByIdAndUpdate } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockFindByIdAndUpdate: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findOne: mockFindOne,
      findByIdAndUpdate: mockFindByIdAndUpdate,
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => {
  class MockNextResponse {
    body: any;
    status: number;
    headers: any;
    constructor(body: any, options: any) {
      this.body = body;
      this.status = options?.status || 200;
      this.headers = options?.headers || {};
    }
    static json(data: any, options: any) {
        return {
            data,
            status: options?.status || 200,
            json: async () => data
        };
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

    const response = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat1', query: 'What is AI?' })
        })
    );

    expect(response.status).toBe(401);
  });

  it('should return 400 if query is missing or too long', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // Missing query
    let response = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat1', query: '' })
        })
    );
    expect(response.status).toBe(400);

    // Too long query
    response = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat1', query: 'a'.repeat(5001) })
        })
    );
    expect(response.status).toBe(400);
  });

  it('should return 404 if chat belongs to another user or does not exist', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOne.mockResolvedValue(null);

    const response = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat1', query: 'What is AI?' })
        })
    );

    expect(response.status).toBe(404);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat1', userId: 'user1' });
  });

  it('should return 200 and a stream if successful', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    const mockChat = {
        _id: 'chat1',
        userId: 'user1',
        messages: { push: vi.fn() },
        save: vi.fn().mockResolvedValue(true)
    };
    mockFindOne.mockResolvedValue(mockChat);

    const response = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat1', query: 'What is AI?' })
        })
    );

    expect(response.status).toBe(200);
    expect((response as any).body).toBeInstanceOf(ReadableStream);
    expect(mockChat.messages.push).toHaveBeenCalled();
    expect(mockChat.save).toHaveBeenCalled();
  });
});
