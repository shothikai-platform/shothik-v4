
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindById, mockCreateSession, mockSaveSession, mockCreateConversation } = vi.hoisted(() => {
  return {
    mockFindById: vi.fn(),
    mockCreateSession: vi.fn(),
    mockSaveSession: vi.fn(),
    mockCreateConversation: vi.fn(),
  };
});

// Mock Mongoose models
vi.mock('@/models/SheetSession', () => ({
  default: {
    findById: mockFindById,
    create: mockCreateSession,
  },
}));

vi.mock('@/models/SheetConversation', () => ({
  default: {
    create: mockCreateConversation,
  },
}));

// Mock NextResponse
vi.mock('next/server', () => {
    class MockNextResponse {
        body: any;
        status: number;
        headers: Headers;
        constructor(body: any, init?: any) {
            this.body = body;
            this.status = init?.status || 200;
            this.headers = new Headers(init?.headers);
        }
        static json(data: any, options?: any) {
            return {
                data,
                options,
                status: options?.status || 200,
                json: async () => data
            };
        }
    }
    return {
        NextResponse: MockNextResponse
    };
});

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/sheet/conversation/create_conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test prompt' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it('should return 400 if prompt is missing', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await (response as any).json();
    expect(data.error).toBe('Prompt is required');
  });

  it('should return 400 if prompt is too long', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    const longPrompt = 'a'.repeat(5001);
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ prompt: longPrompt }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await (response as any).json();
    expect(data.error).toBe('Prompt is too long');
  });

  it('should return 403 if user tries to access someone else\'s session', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    mockFindById.mockResolvedValue({
      _id: 'chat123',
      userId: 'otherUser',
    });

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test prompt', chat: 'chat123' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
    const data = await (response as any).json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should create a new session and conversation for authenticated user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockCreateSession.mockResolvedValue({
      _id: 'newChatId',
      userId: 'user123',
      title: 'test prompt',
    });

    mockCreateConversation.mockResolvedValue({
      _id: 'convId',
      save: vi.fn(),
      events: [],
    });

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test prompt' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockCreateSession).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user123',
    }));
  });
});
