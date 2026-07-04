import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';
import SheetConversation from '@/models/SheetConversation';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindOne, mockCreateSession, mockCreateConversation, mockSave } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockCreateSession: vi.fn(),
    mockCreateConversation: vi.fn(),
    mockSave: vi.fn(),
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

    expect(response.status).toBe(401);
  });

  it('should create a new session if chatId is not provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockCreateSession.mockResolvedValue({ _id: 'session1', title: 'test', save: mockSave });
    mockCreateConversation.mockResolvedValue({ _id: 'conv1', events: [], save: mockSave });

    await POST(new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' }),
    }));

    expect(mockCreateSession).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user123',
    }));
  });

  it('should use findOne with userId for IDOR protection when chatId is provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSession = { _id: 'session1', title: 'old', save: mockSave };
    mockFindOne.mockResolvedValue(mockSession);
    mockCreateConversation.mockResolvedValue({ _id: 'conv1', events: [], save: mockSave });

    await POST(new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test', chat: 'session1' }),
    }));

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'session1', userId: 'user123' });
    expect(mockSave).toHaveBeenCalled();
  });

  it('should create a new session if existing session belongs to another user', async () => {
      const mockUser = { _id: 'user123' };
      (getAuthenticatedUser as any).mockResolvedValue(mockUser);

      // findOne returns null because of userId mismatch in the query
      mockFindOne.mockResolvedValue(null);
      mockCreateSession.mockResolvedValue({ _id: 'new_session', title: 'test', save: mockSave });
      mockCreateConversation.mockResolvedValue({ _id: 'conv1', events: [], save: mockSave });

      await POST(new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test', chat: 'other_user_session' }),
      }));

      expect(mockFindOne).toHaveBeenCalledWith({ _id: 'other_user_session', userId: 'user123' });
      expect(mockCreateSession).toHaveBeenCalledWith(expect.objectContaining({
          userId: 'user123'
      }));
  });
});
