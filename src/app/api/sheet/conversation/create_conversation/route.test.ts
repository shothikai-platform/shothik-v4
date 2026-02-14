
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

// Mock Mongoose model
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
        save: vi.fn(),
      }),
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => {
  const mockJson = vi.fn((data, options) => ({
    data,
    options,
    status: options?.status || 200,
    json: async () => data,
  }));

  class MockNextResponse {
    stream: any;
    options: any;
    status: number;

    constructor(stream: any, options: any) {
      this.stream = stream;
      this.options = options;
      this.status = options?.status || 200;
      // When using 'new', if you return an object, it replaces 'this'
      return {
        stream,
        options,
        status: options?.status || 200,
      };
    }
    static json = mockJson;
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

  it('should verify session ownership if chatId is provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOne.mockResolvedValue({ _id: 'chat123', title: 'Old Title', save: mockSave });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'new prompt', chat: 'chat123' }),
    });

    await POST(request);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });
    expect(mockSave).toHaveBeenCalled();
  });

  it('should create a new session with authenticated user ID if no chatId provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockCreate.mockResolvedValue({ _id: 'newchat123', title: 'new prompt' });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'new prompt' }),
    });

    await POST(request);

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123',
        title: 'new prompt'
    }));
  });
});
