
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

const { mockFindOne, mockCreate, mockSave, MockNextResponse } = vi.hoisted(() => {
  class MockResponse {
    body: any;
    status: number;
    headers: any;
    constructor(body: any, init?: any) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = init?.headers;
    }
    static json(data: any, options?: any) {
      return { data, status: options?.status || 200 };
    }
  }

  return {
    mockFindOne: vi.fn(),
    mockCreate: vi.fn(),
    mockSave: vi.fn(),
    MockNextResponse: MockResponse,
  };
});

// Mock Mongoose models
vi.mock('@/models/SheetSession', () => ({
  default: {
    findOne: mockFindOne,
    create: mockCreate,
  },
}));

vi.mock('@/models/SheetConversation', () => ({
  default: {
    create: vi.fn().mockResolvedValue({
      _id: 'conv123',
      events: [],
      save: mockSave,
    }),
  },
}));

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: MockNextResponse,
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
    mockCreate.mockResolvedValue({ _id: 'session123', title: 'test' });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Create a sheet' }),
    });

    await POST(request);

    expect(mockCreate).toHaveBeenCalledWith({
      userId: 'user123',
      title: 'Create a sheet',
    });
  });

  it('should use existing session if chatId is provided and belongs to user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    const mockSession = { _id: 'session123', title: 'old', save: vi.fn() };
    mockFindOne.mockResolvedValue(mockSession);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Update sheet', chat: 'session123' }),
    });

    await POST(request);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'session123', userId: 'user123' });
    expect(mockSession.save).toHaveBeenCalled();
  });

  it('should create a new session if provided chatId does not belong to user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOne.mockResolvedValue(null); // Not found for this user
    mockCreate.mockResolvedValue({ _id: 'new-session', title: 'new' });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Malicious update', chat: 'other-users-session' }),
    });

    await POST(request);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'other-users-session', userId: 'user123' });
    expect(mockCreate).toHaveBeenCalledWith({
        userId: 'user123',
        title: 'Malicious update'
    });
  });
});
