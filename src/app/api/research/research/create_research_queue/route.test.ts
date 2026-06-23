
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
    class MockResponse {
        public status: number;
        constructor(public body: any, public init: any) {
            this.status = init?.status || 200;
        }
        static json(data: any, options: any) {
            return {
                data,
                options,
                status: options?.status || 200,
                json: async () => data
            };
        }
    }

    return {
        NextResponse: MockResponse
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

    const response = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: '123', query: 'test' })
        })
    );

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat not found or does not belong to user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOne.mockResolvedValue(null);

    const response = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: '123', query: 'test' })
        })
    );

    expect(response.status).toBe(404);
  });

  it('should start research and return stream if authorized', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockChat = {
        _id: '123',
        userId: 'user123',
        messages: {
            push: vi.fn()
        },
        save: vi.fn().mockResolvedValue({})
    };
    mockFindOne.mockResolvedValue(mockChat);

    const response = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: '123', query: 'test' })
        })
    );

    expect(ResearchChat.findOne).toHaveBeenCalledWith({ _id: '123', userId: 'user123' });
    expect(response).toBeDefined();
    expect(response.status).toBe(200);
  });
});
