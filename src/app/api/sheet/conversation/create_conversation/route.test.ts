
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
  NextResponse: class {
    data: any;
    options: any;
    status: number;
    constructor(stream: any, options: any) {
        this.data = stream;
        this.options = options;
        this.status = 200;
    }
    static json(data: any, options: any) {
        return { data, options, status: options?.status || 200 };
    }
  },
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

    const response: any = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should create a new session if chatId is not provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockCreate.mockResolvedValue({ _id: 'session123', title: 'test' });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Create a sheet for fruit' }),
    });

    await POST(request);

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user123',
    }));
  });

  it('should verify session ownership when chatId is provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Simulate finding a session belonging to the user
    const mockSession = { _id: 'session123', title: 'test', save: vi.fn() };
    mockFindOne.mockResolvedValue(mockSession);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Update my sheet', chat: 'session123' }),
    });

    await POST(request);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'session123', userId: 'user123' });
  });
});
