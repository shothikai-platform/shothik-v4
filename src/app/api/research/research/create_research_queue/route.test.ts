
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindOne, mockFindByIdAndUpdate, mockSave } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockFindByIdAndUpdate: vi.fn(),
    mockSave: vi.fn(),
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
        headers: any;
        status: number;
        constructor(body: any, init?: any) {
            this.body = body;
            this.headers = init?.headers || {};
            this.status = init?.status || 200;
        }
        static json(data: any, options?: any) {
            return { data, options, status: options?.status || 200 };
        }
    }
    return {
        NextResponse: MockNextResponse
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

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
        method: 'POST',
        body: JSON.stringify({ chat: 'chat1', query: 'test query' })
    });

    const response = await POST(request) as any;

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat does not belong to user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOne.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
        method: 'POST',
        body: JSON.stringify({ chat: 'chat1', query: 'test query' })
    });

    const response = await POST(request) as any;

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat1', userId: 'user1' });
    expect(response.status).toBe(404);
  });

  it('should return 200 and a stream if chat belongs to user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    const mockChat = {
        _id: 'chat1',
        userId: 'user1',
        messages: [],
        save: mockSave
    };
    mockFindOne.mockResolvedValue(mockChat);
    mockSave.mockResolvedValue(true);

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
        method: 'POST',
        body: JSON.stringify({ chat: 'chat1', query: 'test query' })
    });

    const response = await POST(request) as any;

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat1', userId: 'user1' });
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(ReadableStream);
  });
});
