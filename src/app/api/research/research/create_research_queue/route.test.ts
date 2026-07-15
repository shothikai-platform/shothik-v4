
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
    class MockNextResponse {
        stream: any;
        options: any;
        status: number;
        constructor(stream: any, options: any) {
            this.stream = stream;
            this.options = options;
            this.status = options?.status || 200;
        }
        static json(data: any, options: any) {
            return { data, options, status: options?.status || 200 };
        }
    }
    return {
        NextResponse: MockNextResponse,
    };
});

// Mock global ReadableStream and TextEncoder if not in environment
if (typeof ReadableStream === 'undefined') {
    global.ReadableStream = class {
        constructor(executor: any) {
            executor({
                enqueue: () => {},
                close: () => {},
                error: () => {}
            });
        }
    } as any;
}
if (typeof TextEncoder === 'undefined') {
    global.TextEncoder = class {
        encode(str: string) { return Buffer.from(str); }
    } as any;
}

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
            body: JSON.stringify({ chat: 'chat1', query: 'test' })
        })
    );

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });
    mockFindOne.mockResolvedValue(null);

    const response = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat1', query: 'test' })
        })
    );

    expect(response.status).toBe(404);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat1', userId: 'user2' });
  });

  it('should return 200 and start stream on success', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    const mockChat = {
        _id: 'chat1',
        messages: {
            push: vi.fn()
        },
        save: vi.fn().mockResolvedValue({})
    };
    mockFindOne.mockResolvedValue(mockChat);

    const response = await POST(
        new Request('http://localhost/api/research/research/create_research_queue', {
            method: 'POST',
            body: JSON.stringify({ chat: 'chat1', query: 'test' })
        })
    );

    expect(response.status).toBe(200);
    expect(mockChat.messages.push).toHaveBeenCalled();
    expect(mockChat.save).toHaveBeenCalled();
  });
});
