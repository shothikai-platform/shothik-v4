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

const { mockFindById, mockCreate, mockFindOne } = vi.hoisted(() => {
  return {
    mockFindById: vi.fn(),
    mockCreate: vi.fn().mockImplementation((data) => ({
        ...data,
        _id: 'new_id',
        events: data.events || [],
        save: vi.fn().mockResolvedValue(true)
    })),
    mockFindOne: vi.fn(),
  };
});

// Mock Mongoose models
vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      findById: mockFindById,
      create: mockCreate,
      findOne: mockFindOne,
    },
  };
});

vi.mock('@/models/SheetConversation', () => {
  return {
    default: {
      create: mockCreate,
    },
  };
});

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: class extends (actual as any).NextResponse {
        constructor(body: any, init: any) {
            super(body, init);
        }
        static json(data: any, options: any) {
            return { data, options, status: options?.status || 200, json: async () => data };
        }
    }
  };
});

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

  it('should verify session ownership if chatId is provided', async () => {
      const mockUser = { _id: 'user123' };
      (getAuthenticatedUser as any).mockResolvedValue(mockUser);

      // Mock finding a session that belongs to someone else
      mockFindById.mockResolvedValue({
          _id: 'chat123',
          userId: 'otherUser',
          save: vi.fn().mockResolvedValue(true)
      });
      mockFindOne.mockResolvedValue(null);

      const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
          method: 'POST',
          body: JSON.stringify({ prompt: 'test', chat: 'chat123' })
      });

      await POST(request);

      // Check if findOne was called with the correct filter to verify ownership
      expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat123', userId: mockUser._id });
  });
});
