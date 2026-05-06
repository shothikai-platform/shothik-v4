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
        save: mockSave,
      }),
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => {
    class MockNextResponse {
        body: any;
        headers: any;
        status: number;
        constructor(body: any, init?: any) {
            this.body = body;
            this.headers = init?.headers;
            this.status = init?.status || 200;
        }
        static json(data: any, options: any) {
            return { data, options, status: options?.status || 200 };
        }
    }
    return {
        NextResponse: MockNextResponse
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
        body: JSON.stringify({ prompt: 'test' })
    });
    const response = await POST(req) as any;

    expect(response.status).toBe(401);
  });

  it('should create a new session if no chatId is provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockCreate.mockResolvedValue({ _id: 'session123', title: 'test' });

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test prompt' })
    });
    const response = await POST(req) as any;

    expect(mockCreate).toHaveBeenCalledWith({
        userId: 'user123',
        title: 'test prompt',
    });
    expect(response.status).toBe(200);
  });

  it('should use existing session if valid chatId and owner', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    const mockSession = { _id: 'session123', title: 'old', save: vi.fn() };
    mockFindOne.mockResolvedValue(mockSession);

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'new prompt', chat: 'session123' })
    });
    const response = await POST(req) as any;

    expect(mockFindOne).toHaveBeenCalledWith({
        _id: 'session123',
        userId: 'user123'
    });
    expect(mockSession.save).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it('should create new session if chatId is provided but not found/not owned (IDOR protection)', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOne.mockResolvedValue(null); // Not found or not owned
    mockCreate.mockResolvedValue({ _id: 'newSession123', title: 'new' });

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'new prompt', chat: 'otherUserSession' })
    });
    const response = await POST(req) as any;

    expect(mockFindOne).toHaveBeenCalledWith({
        _id: 'otherUserSession',
        userId: 'user123'
    });
    expect(mockCreate).toHaveBeenCalledWith({
        userId: 'user123',
        title: 'new prompt',
    });
    expect(response.status).toBe(200);
  });
});
