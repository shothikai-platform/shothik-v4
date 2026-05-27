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

const { mockFindById, mockCreate, mockSave } = vi.hoisted(() => {
  return {
    mockFindById: vi.fn(),
    mockCreate: vi.fn(),
    mockSave: vi.fn(),
  };
});

// Mock Mongoose models
vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      findById: mockFindById,
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
  class MockNextResponse {
    body: any;
    options: any;
    status: number;
    headers: Headers;
    constructor(body: any, options: any) {
      this.body = body;
      this.options = options;
      this.status = options?.status || 200;
      this.headers = new Headers(options?.headers || {});
    }
    static json(data: any, options?: any) {
      return {
        json: async () => data,
        status: options?.status || 200,
        headers: new Headers(options?.headers || {}),
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
    mockSave.mockResolvedValue(true);
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

  it('should create a new session with the correct userId', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockCreate.mockResolvedValue({ _id: 'session123', title: 'test', userId: 'user123' });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Create a list' }),
    });

    await POST(request);

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user123',
    }));
  });

  it('should return 404 if session belongs to another user (IDOR protection)', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Session found but belongs to user456
    mockFindById.mockResolvedValue({ _id: 'session123', userId: 'user456' });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'update', chat: 'session123' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('Session not found');
  });
});
