
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
      create: vi.fn().mockImplementation((data) => ({
        ...data,
        _id: 'conv123',
        save: mockSave,
        events: data.events || [],
      })),
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => {
  const json = vi.fn((data, options) => ({
    data,
    options,
    status: options?.status || 200,
  }));

  // Use a class to support 'new' keyword
  class MockNextResponse {
    stream: any;
    init: any;
    status: number;
    static json = json;
    constructor(stream: any, init: any) {
      this.stream = stream;
      this.init = init;
      this.status = init?.status || 200;
    }
  }

  return {
    NextResponse: MockNextResponse,
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

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Test prompt' }),
    });

    const response = await POST(request) as any;

    expect(response.status).toBe(401);
  });

  it('should use authenticated user ID when creating a new session', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockCreate.mockResolvedValue({ _id: 'session123', title: 'Test', save: mockSave });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Test prompt' }),
    });

    await POST(request);

    expect(SheetSession.create).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user123'
    }));

    expect(SheetSession.create).not.toHaveBeenCalledWith(expect.objectContaining({
        userId: 'temp-user'
    }));
  });

  it('should verify session ownership when using an existing chatId', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockFindOne.mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Test prompt', chat: 'session456' }),
    });

    await POST(request);

    expect(SheetSession.findOne).toHaveBeenCalledWith({ _id: 'session456', userId: 'user123' });
  });
});
