import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindOne, mockCreateSession, mockSaveSession } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockCreateSession: vi.fn(),
    mockSaveSession: vi.fn(),
  };
});

vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      findOne: mockFindOne,
      create: mockCreateSession,
    },
  };
});

const { mockCreateConversation, mockSaveConversation } = vi.hoisted(() => {
    return {
      mockCreateConversation: vi.fn(),
      mockSaveConversation: vi.fn(),
    };
  });

vi.mock('@/models/SheetConversation', () => {
  return {
    default: {
      create: mockCreateConversation,
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: class {
    constructor(stream: any, options: any) {
        (this as any).stream = stream;
        (this as any).options = options;
    }
    static json(data: any, options: any) {
        return {
            data,
            options,
            status: options?.status || 200,
            json: async () => data
        };
    }
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/sheet/conversation/create_conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test' })
    });
    const response = await POST(request);

    expect((response as any).status).toBe(401);
  });

  it('should create a new session if chatId is not provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockCreateSession.mockResolvedValue({ _id: 'session123', title: 'test', userId: 'user123' });
    mockCreateConversation.mockResolvedValue({
        _id: 'conv123',
        events: [],
        save: mockSaveConversation
    });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test prompt' })
    });
    const response = await POST(request);

    expect(mockCreateSession).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123'
    }));
    expect(response).toBeDefined();
  });

  it('should return 401 if trying to use a chatId belonging to another user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // findOne returns null because we filter by userId
    mockFindOne.mockResolvedValue(null);

    mockCreateSession.mockResolvedValue({ _id: 'new_session', userId: 'user123' });
    mockCreateConversation.mockResolvedValue({
        _id: 'conv123',
        events: [],
        save: mockSaveConversation
    });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test', chat: 'other_user_session' })
    });
    await POST(request);

    // Should have tried to find session with ownership check
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'other_user_session', userId: 'user123' });
    // Since it wasn't found, it should have created a NEW session for user123
    expect(mockCreateSession).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123'
    }));
  });
});
