
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindOne, mockCreateSession, mockCreateConversation } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockCreateSession: vi.fn(),
    mockCreateConversation: vi.fn(),
  };
});

// Mock Mongoose models
vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      findOne: mockFindOne,
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

// Mock NextResponse correctly as a class with a static json method
vi.mock('next/server', () => {
    class MockNextResponse {
        constructor(public stream: any, public options: any) {}
        static json(data: any, options: any) {
            return { data, options, status: options?.status || 200, json: async () => data };
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

    const response = await POST(new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test' })
    }));

    expect(response.status).toBe(401);
  });

  it('should enforce IDOR protection when using existing chatId', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // session not found for this user
    mockFindOne.mockResolvedValue(null);
    mockCreateSession.mockResolvedValue({ _id: 'newSessionId', title: 'test', save: vi.fn() });
    mockCreateConversation.mockResolvedValue({
        _id: 'convId',
        events: [],
        save: vi.fn()
    });

    await POST(new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test', chat: 'otherUserChatId' })
    }));

    // Should have checked if 'otherUserChatId' belongs to 'user123'
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'otherUserChatId', userId: 'user123' });
    // And since it wasn't found, it should have created a new session for 'user123'
    expect(mockCreateSession).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user123' }));
  });
});
