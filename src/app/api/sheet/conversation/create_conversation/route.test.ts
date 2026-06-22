
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindOne, mockCreate, mockSave } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockCreate: vi.fn(),
    mockSave: vi.fn(),
  };
});

// Mock Mongoose models
vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      findOne: mockFindOne,
      create: mockCreate,
    },
  };
});

vi.mock('@/models/SheetConversation', () => {
  return {
    default: {
      create: vi.fn().mockResolvedValue({
        _id: 'conv123',
        events: [],
        save: mockSave,
      }),
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => {
  const json = vi.fn((data, options) => ({
    data,
    options,
    status: options?.status || 200,
    json: async () => data,
  }));

  class MockNextResponse {
    constructor(body, init) {
      this.body = body;
      this.init = init;
      this.status = init?.status || 200;
    }
    static json = json;
  }

  return {
    NextResponse: MockNextResponse
  };
});

import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';

describe('POST /api/sheet/conversation/create_conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await POST(new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test' })
    }));

    expect(response.status).toBe(401);
  });

  it('should create a new session for the authenticated user if chatId is missing', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockCreate.mockResolvedValue({ _id: 'new_session', title: 'test' });

    await POST(new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test prompt' })
    }));

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123',
        title: 'test prompt'
    }));
  });

  it('should only use existing session if it belongs to the user (IDOR protection)', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // findOne should be called with both id and userId
    mockFindOne.mockResolvedValue(null); // Simulate not found or not owned
    mockCreate.mockResolvedValue({ _id: 'new_session', title: 'test' });

    await POST(new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test', chat: 'other_users_session' })
    }));

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'other_users_session', userId: 'user123' });
    // Should have created a new session instead of using the provided one
    expect(mockCreate).toHaveBeenCalled();
  });
});
