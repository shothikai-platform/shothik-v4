
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

// Mock Mongoose models
const { mockSheetSession, mockSheetConversation } = vi.hoisted(() => {
  return {
    mockSheetSession: {
      findOne: vi.fn(),
      create: vi.fn(),
    },
    mockSheetConversation: {
      create: vi.fn(),
    },
  };
});

vi.mock('@/models/SheetSession', () => ({
  default: mockSheetSession,
}));

vi.mock('@/models/SheetConversation', () => ({
  default: mockSheetConversation,
}));

// Mock NextResponse to capture status and behavior
vi.mock('next/server', () => {
  return {
    NextResponse: class {
      constructor(body, init) {
        this.body = body;
        this.init = init;
        this.status = init?.status || 200;
      }
      static json(body, init) {
        return {
          body,
          status: init?.status || 200,
          json: async () => body,
        };
      }
    }
  };
});


import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/sheet/conversation/create_conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Test prompt' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it('should create a new session with authenticated user ID', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockSheetSession.create.mockResolvedValue({
        _id: 'session123',
        userId: 'user123',
        title: 'Test prompt',
        save: vi.fn(),
    });

    mockSheetConversation.create.mockResolvedValue({
        _id: 'conv123',
        sessionId: 'session123',
        events: [],
        save: vi.fn(),
        response: {},
        status: 'completed',
    });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Test prompt' }),
    });

    await POST(request);

    // Verify correct userId is used
    expect(mockSheetSession.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123',
    }));
  });

  it('should enforce ownership when accessing an existing session (IDOR check)', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Mock findOne to return null when searching with correct user ID but wrong chat ID (or chat belonging to someone else)
    // The implementation calls findOne({ _id: chatId, userId: user._id })
    // If the session belongs to 'userOther', this query will return null.
    mockSheetSession.findOne.mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Test prompt', chat: 'sessionOther' }),
    });

    const response = await POST(request);

    // Expect Not Found (404) as per implementation
    expect(response.status).toBe(404);

    // Verify that findOne was called with correct parameters (including userId)
    expect(mockSheetSession.findOne).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'sessionOther',
        userId: 'user123'
    }));
  });
});
