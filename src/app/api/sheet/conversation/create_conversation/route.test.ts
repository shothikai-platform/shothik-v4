
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

const { mockFindById, mockFindOne, mockCreate, mockSave } = vi.hoisted(() => {
  return {
    mockFindById: vi.fn(),
    mockFindOne: vi.fn(),
    mockCreate: vi.fn(),
    mockSave: vi.fn(),
  };
});

// Mock Mongoose models
vi.mock('@/models/SheetSession', () => ({
  default: {
    findById: mockFindById,
    findOne: mockFindOne,
    create: mockCreate,
  },
}));

vi.mock('@/models/SheetConversation', () => ({
  default: {
    create: vi.fn().mockResolvedValue({
        _id: 'conv123',
        save: mockSave,
        events: []
    }),
  },
}));

// Mock NextResponse
vi.mock('next/server', () => ({
    NextResponse: class {
        static json(data: any, options: any) {
            return { data, options, status: options?.status || 200 };
        }
        constructor(stream: any, options: any) {
            return { stream, options, status: options?.status || 200 } as any;
        }
    }
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
        body: JSON.stringify({ prompt: 'test prompt' })
    });

    const response = await POST(request);

    // This will currently FAIL because the route doesn't check auth
    expect(response.status).toBe(401);
  });

  it('should verify ownership of the session if chatId is provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOne.mockResolvedValue({ _id: 'session123', userId: 'user123', save: vi.fn() });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test prompt', chat: 'session123' })
    });

    await POST(request);

    // This will currently FAIL because it uses findById('session123') instead of scoping by userId
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'session123', userId: 'user123' });
  });

  it('should use the authenticated user ID for new sessions instead of "temp-user"', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ _id: 'new_session', userId: 'user123' });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test prompt' })
    });

    await POST(request);

    // This will currently FAIL because it uses 'temp-user'
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123'
    }));
  });
});
