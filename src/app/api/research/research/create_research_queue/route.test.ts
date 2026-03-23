import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextResponse } from 'next/server';

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindOne, mockFindOneAndUpdate, mockSave, mockPush } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockFindOneAndUpdate: vi.fn(),
    mockSave: vi.fn(),
    mockPush: vi.fn()
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

// Mock TextEncoder and ReadableStream globally for the test environment if missing,
// though typically present in modern JS environments.
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

if (typeof global.ReadableStream === 'undefined') {
    class MockReadableStream {
        constructor() {}
    }
    global.ReadableStream = MockReadableStream as any;
}

vi.mock('next/server', () => ({
  NextResponse: class MockNextResponse {
      status?: number;
      constructor(body: any, init?: any) {
          if (body && typeof body === 'object' && body.error) {
              // Handle json responses
              return { json: async () => body, status: init?.status || 200 } as any;
          }
          // Handle stream response
          return { stream: body, status: init?.status || 200 } as any;
      }
      static json(data: any, options?: any) {
          return { json: async () => data, status: options?.status || 200 };
      }
  }
}));


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
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const response = await POST(request) as any;
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // Mock findOne to return null (not found for this user)
    mockFindOne.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
        method: 'POST',
        body: JSON.stringify({ chat: 'chat1', query: 'test query' }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const response = await POST(request) as any;
    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.error).toBe('Chat not found or unauthorized');
  });

  it('should process successfully if authenticated and authorized', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // Mock findOne to return a valid chat with push and save methods
    mockFindOne.mockResolvedValue({
        _id: 'chat1',
        userId: 'user1',
        messages: { push: mockPush },
        save: mockSave
    });

    const request = new Request('http://localhost/api/research/research/create_research_queue', {
        method: 'POST',
        body: JSON.stringify({ chat: 'chat1', query: 'test query' }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const response = await POST(request) as any;

    // Check if the initial steps succeeded
    expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({ role: 'user', content: 'test query' }));
    expect(mockSave).toHaveBeenCalled();

    // The response is a stream, so status is 200
    expect(response.status).toBe(200);
  });
});
