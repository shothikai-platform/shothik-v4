
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
  class MockNextResponse {
    static json = vi.fn((data, options) => ({
      data,
      options,
      status: options?.status || 200,
    }));
    constructor(stream, options) {
      return {
        stream,
        options,
        status: options?.status || 200,
      };
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
    mockCreate.mockResolvedValue({ _id: 'session123', title: 'test' });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test prompt' }),
    });

    await POST(request);

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user123',
      title: 'test prompt',
    }));
  });

  it('should use findOne with ownership check if chatId is provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSession = {
        _id: 'session123',
        title: 'old title',
        save: vi.fn().mockResolvedValue(true)
    };
    mockFindOne.mockResolvedValue(mockSession);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test prompt', chat: 'session123' }),
    });

    await POST(request);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'session123', userId: 'user123' });
    expect(mockSession.save).toHaveBeenCalled();
  });
});
