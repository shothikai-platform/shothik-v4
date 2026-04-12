
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindOne, mockSave, mockFindByIdAndUpdate } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockSave: vi.fn(),
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
        data: any;
        options: any;
        status: number;
        headers: Headers;

        constructor(body: any, options: any) {
            this.data = body;
            this.options = options;
            this.status = options?.status || 200;
            this.headers = new Headers(options?.headers);
        }

        static json(data: any, options?: any) {
            return new MockNextResponse(data, options);
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
      body: JSON.stringify({ chat: 'chat1', query: 'test query' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // findOne returns null when searching for chat1 + user1 if it belongs to user2
    mockFindOne.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat1', query: 'test query' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(404);
  });

  it('should return 200 if user is owner', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    mockFindOne.mockResolvedValue({
        _id: 'chat1',
        userId: 'user1',
        messages: { push: vi.fn() },
        save: mockSave
    });

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
      method: 'POST',
      body: JSON.stringify({ chat: 'chat1', query: 'test query' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });
});
