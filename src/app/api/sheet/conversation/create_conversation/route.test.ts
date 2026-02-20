
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Use vi.hoisted for ALL variables used in vi.mock
const { mockFindOne, mockCreateSession, mockCreateConversation, MockNextResponse } = vi.hoisted(() => {
  const mFindOne = vi.fn();
  const mCreateSession = vi.fn();
  const mCreateConversation = vi.fn();

  // Define as a regular function to be used as a constructor
  const mNextResponse = vi.fn().mockImplementation(function(body, init) {
    return {
      body,
      ...init,
      status: init?.status || 200,
    };
  }) as any;

  mNextResponse.json = vi.fn((data, options) => ({
    data,
    ...options,
    status: options?.status || 200
  }));

  return {
    mockFindOne: mFindOne,
    mockCreateSession: mCreateSession,
    mockCreateConversation: mCreateConversation,
    MockNextResponse: mNextResponse
  };
});

vi.mock('@/models/SheetSession', () => ({
  default: {
    findOne: mockFindOne,
    create: mockCreateSession,
  }
}));

vi.mock('@/models/SheetConversation', () => ({
  default: {
    create: mockCreateConversation,
  }
}));

vi.mock('next/server', () => ({
  NextResponse: MockNextResponse
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

  it('should create a new session if chatId is not provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockCreateSession.mockResolvedValue({ _id: 'session123', title: 'New Spreadsheet' });
    mockCreateConversation.mockResolvedValue({ _id: 'conv123', events: [], save: vi.fn() });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Create a list of fruits' }),
    });

    const response = await POST(request);

    expect(mockCreateSession).toHaveBeenCalledWith({
      userId: 'user123',
      title: 'Create a list of fruits',
    });
    expect(response.status).toBe(200);
  });

  it('should use existing session and verify ownership if chatId is provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSession = { _id: 'session123', title: 'Existing', save: vi.fn() };
    mockFindOne.mockResolvedValue(mockSession);
    mockCreateConversation.mockResolvedValue({ _id: 'conv123', events: [], save: vi.fn() });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Update sheet', chat: 'session123' }),
    });

    const response = await POST(request);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'session123', userId: 'user123' });
    expect(mockCreateConversation).toHaveBeenCalledWith(expect.objectContaining({
      sessionId: 'session123',
    }));
    expect(response.status).toBe(200);
  });
});
