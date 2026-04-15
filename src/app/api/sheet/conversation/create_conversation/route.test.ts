
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
        _id: 'conv1',
        events: [],
        status: 'generating',
        save: mockSave,
      }),
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => {
    class MockNextResponse {
        data: any;
        options: any;
        status: number;
        constructor(body: any, options: any) {
            this.data = body;
            this.options = options;
            this.status = options?.status || 200;
        }
        static json(data: any, options: any) {
            return new MockNextResponse(data, options);
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

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it('should create a new session with the correct userId if no chatId is provided', async () => {
    const userId = 'user123';
    (getAuthenticatedUser as any).mockResolvedValue({ _id: userId });
    mockCreate.mockResolvedValue({ _id: 'new_session_id', title: 'test', save: vi.fn() });

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' }),
    });

    await POST(req);

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      userId: userId,
    }));
  });

  it('should verify ownership when an existing chatId is provided', async () => {
    const userId = 'user123';
    (getAuthenticatedUser as any).mockResolvedValue({ _id: userId });

    // Mock findOne to return null (simulating session not found or not belonging to user)
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ _id: 'new_session_id', title: 'test', save: vi.fn() });

    const chatId = 'other_users_session';
    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test', chat: chatId }),
    });

    await POST(req);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: chatId, userId: userId });
    // Should create a new session since findOne returned null
    expect(mockCreate).toHaveBeenCalled();
  });
});
