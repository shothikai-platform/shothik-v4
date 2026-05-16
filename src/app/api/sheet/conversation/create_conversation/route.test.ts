
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
        _id: 'conv123',
        events: [],
        save: vi.fn(),
      }),
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => {
    class MockNextResponse {
        body: any;
        status: number;
        headers: any;
        constructor(body: any, init: any) {
            this.body = body;
            this.status = init?.status || 200;
            this.headers = init?.headers || {};
        }
        static json(data: any, options: any) {
            return { data, options, status: options?.status || 200 };
        }
    }
    return {
        NextResponse: MockNextResponse,
    };
});

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/sheet/conversation/create_conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' }),
    }));

    expect((response as any).status).toBe(401);
  });

  it('should return 404 if chat ID is provided but session does not belong to user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    mockFindOne.mockResolvedValue(null);

    const response = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test', chat: 'otherChatId' }),
    }));

    expect((response as any).status).toBe(404);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'otherChatId', userId: 'user123' });
  });

  it('should create a new session with the authenticated user ID if no chatId provided', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    mockCreate.mockResolvedValue({ _id: 'newSessionId', title: 'test', save: vi.fn() });

    await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' }),
    }));

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user123',
    }));
  });
});
