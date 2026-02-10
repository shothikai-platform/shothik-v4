
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextResponse } from 'next/server';

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
        save: vi.fn(),
      }),
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => {
    class MockNextResponse {
        stream: any;
        options: any;
        status: number;
        constructor(stream: any, options: any) {
            this.stream = stream;
            this.options = options;
            this.status = options?.status || 200;
        }
        static json(data: any, options: any) {
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

    const response = await POST(new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test' })
    }));

    expect(response.status).toBe(401);
  });

  it('should verify ownership when chatId is provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSession = {
        _id: 'session123',
        title: 'Old Title',
        save: mockSave
    };
    mockFindOne.mockResolvedValue(mockSession);

    const response = await POST(new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'new prompt', chat: 'session123' })
    }));

    expect(mockFindOne).toHaveBeenCalledWith({
        _id: 'session123',
        userId: 'user123'
    });
    expect(response.status).toBe(200);
  });

  it('should create a new session with current user ID if no chatId provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockCreate.mockResolvedValue({ _id: 'newSession123', title: 'test', save: mockSave });

    const response = await POST(new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test prompt' })
    }));

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123'
    }));
    expect(response.status).toBe(200);
  });
});
