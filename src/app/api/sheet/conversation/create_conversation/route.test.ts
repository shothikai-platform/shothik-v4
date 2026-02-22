
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
        save: vi.fn().mockResolvedValue({}),
      }),
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => {
  const jsonMock = vi.fn((data, options) => ({
    data,
    options,
    status: options?.status || 200,
    json: async () => data,
  }));

  function MockNextResponse(body: any, init: any) {
    return {
      body,
      ...init,
      status: init?.status || 200,
    };
  }
  (MockNextResponse as any).json = jsonMock;

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
      body: JSON.stringify({ prompt: 'test prompt' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it('should create a new session if chatId is not provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockCreate.mockResolvedValue({ _id: 'session123', title: 'test prompt' });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test prompt' }),
    });

    const response = await POST(request);

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user123',
      title: 'test prompt'
    }));
    expect(response.status).toBe(200);
  });

  it('should use existing session if chatId is provided and owned by user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSession = {
        _id: 'session123',
        title: 'old title',
        save: mockSave
    };
    mockFindOne.mockResolvedValue(mockSession);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test prompt', chat: 'session123' }),
    });

    const response = await POST(request);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'session123', userId: 'user123' });
    expect(mockSave).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it('should create new session if chatId is provided but not owned by user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // findOne returns null because ownership check fails in the query
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ _id: 'newSession123', title: 'test prompt' });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test prompt', chat: 'otherSession123' }),
    });

    const response = await POST(request);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'otherSession123', userId: 'user123' });
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user123'
    }));
    expect(response.status).toBe(200);
  });
});
