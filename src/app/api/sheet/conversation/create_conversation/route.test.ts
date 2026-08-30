import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindOne, mockCreateSession, mockSaveSession, mockCreateConversation, mockSaveConversation } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockCreateSession: vi.fn(),
    mockSaveSession: vi.fn(),
    mockCreateConversation: vi.fn(),
    mockSaveConversation: vi.fn(),
  };
});

vi.mock('@/models/SheetSession', () => ({
  default: {
    findOne: mockFindOne,
    create: mockCreateSession,
  },
}));

vi.mock('@/models/SheetConversation', () => ({
  default: {
    create: mockCreateConversation,
  },
}));

vi.mock('next/server', () => {
  class MockNextResponse extends Response {
    static json(data: any, options?: any) {
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

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Create budget sheet' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it('should return 404 if chatId does not belong to the user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOne.mockResolvedValue(null);

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Update budget', chat: 'invalid-or-other-user-session-id' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(404);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'invalid-or-other-user-session-id', userId: 'user1' });
  });

  it('should create a new session scoped to the authenticated user when no chatId is provided', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ id: 'user123' });
    const mockSession = { _id: 'session1', userId: 'user123', title: 'New Spreadsheet' };
    const mockConversation = {
      _id: 'conv1',
      response: null,
      status: 'generating',
      events: [],
      save: mockSaveConversation,
    };

    mockCreateSession.mockResolvedValue(mockSession);
    mockCreateConversation.mockResolvedValue(mockConversation);

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'New Spreadsheet' }),
    });

    const response = await POST(req);
    expect(mockCreateSession).toHaveBeenCalledWith({
      userId: 'user123',
      title: 'New Spreadsheet',
    });
    expect(response).toBeInstanceOf(Response);
  });
});
