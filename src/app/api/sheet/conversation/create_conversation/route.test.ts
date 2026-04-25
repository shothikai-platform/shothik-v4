import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

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

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: class {
    constructor(body, options) {
      this.body = body;
      this.options = options;
      this.status = options?.status || 200;
    }
    static json(data, options) {
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
      body: JSON.stringify({ prompt: 'test' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should verify ownership when chatId is provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockFindOne.mockResolvedValue(null); // Simulate session not found or not owned
    mockCreateSession.mockResolvedValue({ _id: 'newSession123', title: 'test', save: mockSave });
    mockCreateConversation.mockResolvedValue({
        _id: 'conv123',
        events: [],
        save: mockSave
    });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test', chat: 'otherSession123' }),
    });

    await POST(request);

    // Verify findOne was called with ownership check
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'otherSession123', userId: 'user123' });
    // Verify a new session was created because the existing one wasn't found/owned
    expect(mockCreateSession).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user123' }));
  });

  it('should create session with correct userId for new chats', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockCreateSession.mockResolvedValue({ _id: 'newSession123', title: 'test', save: mockSave });
    mockCreateConversation.mockResolvedValue({
        _id: 'conv123',
        events: [],
        save: mockSave
    });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' }),
    });

    await POST(request);

    expect(mockCreateSession).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user123' }));
  });
});
