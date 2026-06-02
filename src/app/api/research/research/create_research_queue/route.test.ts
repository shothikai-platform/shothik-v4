
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Use vi.hoisted for the mock class
const { MockNextResponse } = vi.hoisted(() => {
  class MockNextResponse {
    stream: any;
    options: any;
    status: number;
    headers: any;

    constructor(stream: any, options: any) {
      this.stream = stream;
      this.options = options;
      this.status = options?.status || 200;
      this.headers = options?.headers || {};
    }

    static json(data: any, options: any) {
      return { data, options, status: options?.status || 200 };
    }
  }
  return { MockNextResponse };
});

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
vi.mock('next/server', () => ({
  NextResponse: MockNextResponse,
}));

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
            body: JSON.stringify({ chat: 'chat1', query: 'test query' })
        })
    );

    expect(response.status).toBe(401);
  });

  it('should return 400 if chatId or query is missing', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const response = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat1' })
        })
    );

    expect(response.status).toBe(400);
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });
    mockFindOne.mockResolvedValue(null);

    const response = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat1', query: 'test query' })
        })
    );

    expect(response.status).toBe(404);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat1', userId: 'user2' });
  });

  it('should start research successfully if authorized', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    const mockChat = {
        _id: 'chat1',
        userId: 'user1',
        messages: [],
        save: mockSave
    };
    mockFindOne.mockResolvedValue(mockChat);
    mockSave.mockResolvedValue(true);

    const response = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat1', query: 'test query' })
        })
    );

    expect(response.status).toBe(200);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat1', userId: 'user1' });
    expect(mockSave).toHaveBeenCalled();
  });
});
