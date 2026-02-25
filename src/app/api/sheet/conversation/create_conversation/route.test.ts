
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
      create: mockCreate.mockImplementation((data) => ({ ...data, _id: 'session123', save: mockSave })),
    },
  };
});

vi.mock('@/models/SheetConversation', () => {
  return {
    default: {
      create: vi.fn().mockImplementation((data) => ({ ...data, _id: 'conv123', save: mockSave, events: data.events || [] })),
    },
  };
});

// Mock NextResponse
const { MockNextResponse } = vi.hoisted(() => {
  function mock(this: any, body: any, init: any) {
    this.body = body;
    this.init = init;
    this.status = init?.status || 200;
    this.headers = new Map(Object.entries(init?.headers || {}));
    return this;
  }

  (mock as any).json = vi.fn().mockImplementation((data, options) => ({
    data,
    options,
    status: options?.status || 200,
  }));

  return { MockNextResponse: mock };
});

vi.mock('next/server', () => ({
  NextResponse: MockNextResponse,
}));

// Since the route uses new NextResponse(stream, ...), we need to handle that.
// The mock above should handle it.

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

    // NextResponse.json is actually mocked as the mock implementation of NextResponse
    // because Next.js NextResponse.json returns an instance of NextResponse.
    // In our mock, we check status.
    expect((response as any).status).toBe(401);
  });

  it('should create a new session with the authenticated user ID if no chatId is provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Create a list of fruits' }),
    });

    await POST(request);

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user123',
      title: 'Create a list of fruits',
    }));
  });

  it('should verify ownership when an existing chatId is provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOne.mockResolvedValue(null); // Simulate session not found or not belonging to user

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test', chat: 'existing-chat-id' }),
    });

    await POST(request);

    expect(mockFindOne).toHaveBeenCalledWith({
      _id: 'existing-chat-id',
      userId: 'user123'
    });

    // Should create a new session since findOne returned null (not found or not owner)
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123'
    }));
  });
});
