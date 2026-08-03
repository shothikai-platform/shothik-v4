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

// Mock NextResponse to support both constructor and .json helper
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

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/sheet/conversation/create_conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCreateConversation.mockResolvedValue({
      _id: 'conv123',
      sessionId: 'session123',
      events: [],
      save: vi.fn(),
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Create budget sheet' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it('should return 404 if user provides chat id that does not belong to them', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOne.mockResolvedValue(null); // not found under this user

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Create budget sheet', chat: 'other_user_chat_id' }),
    });

    const response = await POST(request);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'other_user_chat_id', userId: 'user123' });
    expect(response.status).toBe(404);
  });

  it('should create a new session scoped to the authenticated user if no chatId is provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockCreateSession.mockResolvedValue({
      _id: 'session123',
      title: 'New Spreadsheet',
    });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Create budget sheet' }),
    });

    const response = await POST(request);

    expect(mockCreateSession).toHaveBeenCalledWith({
      userId: 'user123',
      title: 'Create budget sheet',
    });
    expect(response.status).toBe(200);
  });
});
