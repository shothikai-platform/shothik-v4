
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

const { mockFindOne, mockCreateSession, mockCreateConversation, MockNextResponse } = vi.hoisted(() => {
  class MockNextResponse {
    stream: any;
    options: any;
    status: number;
    static json = vi.fn((data, options) => ({
      data,
      status: options?.status || 200,
      json: async () => data
    }));

    constructor(stream, options) {
      this.stream = stream;
      this.options = options;
      this.status = options?.status || 200;
    }
  }

  return {
    mockFindOne: vi.fn(),
    mockCreateSession: vi.fn(),
    mockCreateConversation: vi.fn(),
    MockNextResponse,
  };
});

// Mock Mongoose models
vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      findOne: mockFindOne,
      findById: mockFindOne,
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

vi.mock('next/server', () => ({
  NextResponse: MockNextResponse,
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/sheet/conversation/create_conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCreateSession.mockResolvedValue({ _id: 'new-session-id', title: 'New' });
    mockCreateConversation.mockResolvedValue({
      _id: 'conv-id',
      events: [],
      save: vi.fn().mockResolvedValue({}),
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Hello' }),
    });

    const response = await POST(req);

    expect(response.status).toBe(401);
  });

  it('should use authenticated user ID for new sessions', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Hello' }),
    });

    await POST(req);

    expect(mockCreateSession).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user123'
    }));
  });

  it('should verify ownership when chatId is provided', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    // findOne returns null if session not found OR doesn't belong to user
    mockFindOne.mockResolvedValue(null);

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Hello', chat: 'some-session-id' }),
    });

    await POST(req);

    // Verify findOne was called with both ID and userId
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'some-session-id', userId: 'user123' });

    // Since session was not found/authorized, it should create a NEW session for user123
    expect(mockCreateSession).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123'
    }));
  });
});
