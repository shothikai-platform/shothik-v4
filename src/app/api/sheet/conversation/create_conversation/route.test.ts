
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
vi.mock('next/server', () => ({
  NextResponse: class {
    constructor(body, init) {
        this.body = body;
        this.init = init;
        this.status = init?.status || 200;
        this.headers = init?.headers || {};
    }
    static json(data, options) {
      return { data, options, status: options?.status || 200, json: async () => data };
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
        body: JSON.stringify({ prompt: 'test' })
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it('should verify ownership of existing session', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Mock findOne to return null (simulating session not found or not owned by user)
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ _id: 'newSession123', userId: 'user123', title: 'test', save: vi.fn() });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test', chat: 'otherUserSession' })
    });
    await POST(request);

    // Verify findOne was called with user ownership check
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'otherUserSession', userId: 'user123' });
    // Since it returned null, a new session should have been created for the current user
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user123' }));
  });
});
