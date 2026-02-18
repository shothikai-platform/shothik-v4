
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
      create: vi.fn().mockResolvedValue({
        _id: 'conv123',
        events: [],
        save: mockSave,
      }),
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: function(stream: any, options: any) {
    return { stream, options, status: options?.status || 200 };
  },
}));

// Add json helper to NextResponse mock
(NextResponse as any).json = vi.fn((data, options) => ({ data, options, status: options?.status || 200 }));


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

  it('should create session with authenticated userId instead of temp-user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockCreate.mockResolvedValue({ _id: 'session123', title: 'test' });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' }),
    });

    await POST(request);

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user123'
    }));
  });

  it('should verify session ownership if chatId is provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Mock session belonging to another user
    mockFindById.mockResolvedValue({ _id: 'session456', userId: 'otherUser', save: mockSave });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test', chat: 'session456' }),
    });

    const response = await POST(request);

    // It should either return 403 or create a NEW session for the current user
    // Given the current logic, if it doesn't find the session (or if ownership fails), it should create a new one.
    // But if it DOES find it, it currently uses it without check.

    expect(response.status).toBe(403);
  });
});
