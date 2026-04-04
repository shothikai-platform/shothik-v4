
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

const { mockFindById, mockCreateSession, mockCreateConversation, mockSave } = vi.hoisted(() => {
  return {
    mockFindById: vi.fn(),
    mockCreateSession: vi.fn(),
    mockCreateConversation: vi.fn(),
    mockSave: vi.fn(),
  };
});

// Mock Mongoose models
vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      findById: mockFindById,
      create: mockCreateSession,
    },
  };
});

vi.mock('@/models/SheetConversation', () => {
  return {
    default: {
      create: mockCreateConversation,
    },
  };
});

const { MockNextResponse } = vi.hoisted(() => {
  class MockNextResponse {
    status: number;
    headers: any;
    stream: any;
    data: any;
    options: any;

    constructor(stream: any, init?: any) {
      this.stream = stream;
      this.status = init?.status || 200;
      this.headers = init?.headers;
    }

    static json(data: any, options?: any) {
      const res = new MockNextResponse(null, options);
      res.data = data;
      res.options = options;
      return res;
    }

    async json() {
      return this.data;
    }
  }
  return { MockNextResponse };
});

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: MockNextResponse,
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/sheet/conversation/create_conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await POST(new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' }),
    }));

    // Current behavior: 200 (creates session with 'temp-user')
    // Desired behavior: 401 (Unauthorized)
    expect(response.status).toBe(401);
  });

  it('should only use existing session if it belongs to the authenticated user', async () => {
    const user = { _id: 'user1' };
    (getAuthenticatedUser as any).mockResolvedValue(user);

    // Mock existing session belonging to user2
    const otherSession = {
        _id: 'chat1',
        userId: 'user2',
        title: 'Other Chat',
        save: mockSave
    };
    mockFindById.mockResolvedValue(otherSession);
    mockCreateSession.mockResolvedValue({ _id: 'new_chat', userId: 'user1', save: mockSave });
    mockCreateConversation.mockResolvedValue({ _id: 'conv1', events: [], save: mockSave });

    await POST(new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test', chat: 'chat1' }),
    }));

    // Current behavior: findById(chatId) is called, if found it is used without ownership check.
    // Desired behavior: ownership check should be performed.
    // If not owner, it should either return 403 or create a new session.
    // Based on ResearchChat's behavior, it should probably return 404 or 403.
    // In our case, the current code just checks `if (!session)`.
    // If we fix it to find by _id and userId, `session` will be null for other users.

    expect(mockFindById).not.toHaveBeenCalled(); // Should use findOne instead
  });
});
