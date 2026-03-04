import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';
import SheetConversation from '@/models/SheetConversation';
import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/models/SheetConversation', () => ({
  default: {
    create: vi.fn(),
  },
}));

// Mock NextResponse
vi.mock('next/server', () => {
    class MockNextResponse {
        body: any;
        status: number;
        constructor(body: any, init?: any) {
            this.body = body;
            this.status = init?.status || 200;
        }
        static json(data: any, init?: any) {
            return {
                ...data,
                status: init?.status || 200,
                json: async () => data,
            };
        }
    }
    return { NextResponse: MockNextResponse };
});

describe('POST /api/sheet/conversation/create_conversation', () => {
  const mockUser = { _id: 'test-user-id', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Make a table' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(await (response as any).json()).toEqual({ error: 'Unauthorized' });
  });

  it('should return 404 if chat belongs to another user (IDOR prevention)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Mock that the chat is not found when querying with the user's ID
    (SheetSession.findOne as any).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Make a table', chat: 'someone-elses-chat-id' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(404);
    expect(await (response as any).json()).toEqual({ error: 'Chat not found or unauthorized' });
    expect(SheetSession.findOne).toHaveBeenCalledWith({
        _id: 'someone-elses-chat-id',
        userId: 'test-user-id'
    });
  });

  it('should create a new session using the authenticated user ID', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Mock new session creation
    const mockSession = { _id: 'new-session-id', title: 'Make a table', userId: mockUser._id };
    (SheetSession.create as any).mockResolvedValue(mockSession);

    const mockConversation = { _id: 'new-conv-id', status: 'generating' };
    (SheetConversation.create as any).mockResolvedValue(mockConversation);

    const request = new Request('http://localhost:3000/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Make a table' }),
    });

    const response = await POST(request);

    // Should return a stream (NextResponse constructor)
    expect(response.status).toBe(200);
    expect(SheetSession.create).toHaveBeenCalledWith({
        userId: 'test-user-id',
        title: 'Make a table',
    });
    expect(SheetConversation.create).toHaveBeenCalledWith(expect.objectContaining({
        sessionId: 'new-session-id',
        prompt: 'Make a table',
    }));
  });

  it('should update an existing session if user is authorized', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Mock that the chat IS found
    const mockSession = { _id: 'existing-session-id', title: 'Old title', userId: mockUser._id, save: vi.fn() };
    (SheetSession.findOne as any).mockResolvedValue(mockSession);

    const mockConversation = { _id: 'new-conv-id', status: 'generating' };
    (SheetConversation.create as any).mockResolvedValue(mockConversation);

    const request = new Request('http://localhost:3000/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Make a table', chat: 'existing-session-id' }),
    });

    const response = await POST(request);

    // Should return a stream
    expect(response.status).toBe(200);
    expect(SheetSession.findOne).toHaveBeenCalledWith({
        _id: 'existing-session-id',
        userId: 'test-user-id'
    });
    expect(mockSession.title).toBe('Make a table');
    expect(mockSession.save).toHaveBeenCalled();
  });
});
