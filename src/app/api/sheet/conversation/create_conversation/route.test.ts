
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindOne, mockCreate, mockSave } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockCreate: vi.fn(),
    mockSave: vi.fn(),
  };
});

// Mock Mongoose models
vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      findOne: mockFindOne,
      create: mockCreate,
    },
  };
});

vi.mock('@/models/SheetConversation', () => {
  return {
    default: {
      create: vi.fn().mockResolvedValue({
        _id: 'conv1',
        events: [],
        save: mockSave,
      }),
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
import SheetSession from '@/models/SheetSession';

describe('POST /api/sheet/conversation/create_conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test prompt' })
    });

    const response = await POST(request) as any;

    expect(response.status).toBe(401);
  });

  it('should return 400 if prompt is missing or too long', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'a'.repeat(5001) })
    });

    const response = await POST(request) as any;
    expect(response.status).toBe(400);
  });

  it('should create a new session if chatId is not provided', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockCreate.mockResolvedValue({ _id: 'session1', title: 'test', save: mockSave });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test prompt' })
    });

    const response = await POST(request) as any;

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user1' }));
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(ReadableStream);
  });

  it('should use existing session if chatId is provided and belongs to user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOne.mockResolvedValue({ _id: 'session1', title: 'test', save: mockSave });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test prompt', chat: 'session1' })
    });

    const response = await POST(request) as any;

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'session1', userId: 'user1' });
    expect(response.status).toBe(200);
  });

  it('should create a new session if provided chatId does not belong to user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ _id: 'new_session', title: 'test', save: mockSave });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test prompt', chat: 'other_user_session' })
    });

    const response = await POST(request) as any;

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'other_user_session', userId: 'user1' });
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user1' }));
    expect(response.status).toBe(200);
  });
});
