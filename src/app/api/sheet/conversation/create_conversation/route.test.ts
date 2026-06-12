import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';
import SheetConversation from '@/models/SheetConversation';
import { NextResponse } from 'next/server';

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
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

vi.mock('next/server', () => {
  const mockNextResponse = function(stream: any, options: any) {
    return {
      stream,
      options,
      status: options?.status || 200,
      headers: options?.headers,
      json: async () => ({})
    };
  };
  (mockNextResponse as any).json = vi.fn((data, options) => ({
    data,
    options,
    status: options?.status || 200,
    json: async () => data
  }));
  return {
    NextResponse: mockNextResponse,
  };
});

describe('POST /api/sheet/conversation/create_conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it('should prevent IDOR by checking userId when fetching existing session', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const chatId = 'otherUserChatId';
    (SheetSession.findOne as any).mockResolvedValue(null); // Simulate not finding the session for this user

    const mockNewSession = { _id: 'newSessionId', title: 'New Spreadsheet' };
    (SheetSession.create as any).mockResolvedValue(mockNewSession);
    (SheetConversation.create as any).mockResolvedValue({
        _id: 'convId',
        events: [],
        save: vi.fn()
    });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test', chat: chatId }),
    });

    await POST(request);

    // Verify it tried to find the session with BOTH chatId AND userId
    expect(SheetSession.findOne).toHaveBeenCalledWith({ _id: chatId, userId: 'user123' });

    // Verify it created a new session because it couldn't find/access the old one
    expect(SheetSession.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123'
    }));
  });

  it('should create new session with authenticated userId', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockNewSession = { _id: 'newSessionId', title: 'test' };
    (SheetSession.create as any).mockResolvedValue(mockNewSession);
    (SheetConversation.create as any).mockResolvedValue({
        _id: 'convId',
        events: [],
        save: vi.fn()
    });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' }),
    });

    await POST(request);

    expect(SheetSession.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123'
    }));
  });
});
