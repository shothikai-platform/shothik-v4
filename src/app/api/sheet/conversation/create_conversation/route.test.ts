import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock Mongoose models
const { mockFindOne, mockCreate, mockSave } = vi.hoisted(() => {
  return {
    mockFindOne: vi.fn(),
    mockCreate: vi.fn(),
    mockSave: vi.fn(),
  };
});

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
      create: mockCreate, // reusing same mock for simplicity
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => {
  return {
    NextResponse: class {
      constructor(body: any, init: any) {
        this.body = body;
        this.status = init?.status || 200;
      }
      static json(data: any, options: any) {
        return { data, options, status: options?.status || 200 };
      }
    },
  };
});

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/sheet/conversation/create_conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    mockCreate.mockResolvedValue({ _id: 'new-session', save: mockSave, events: [] });
    // Default findOne returns null (not found)
    mockFindOne.mockResolvedValue(null);
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const mockReq = {
        json: async () => ({ prompt: 'test' })
    } as unknown as Request;

    const response = await POST(mockReq);

    expect(response.status).toBe(401);
  });

  it('should create a session with authenticated user ID if new', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockReq = {
        json: async () => ({ prompt: 'test' })
    } as unknown as Request;

    await POST(mockReq);

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123',
        title: 'test'
    }));
  });

  it('should prevent IDOR: user cannot access another user\'s session', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Mock existing session belonging to another user
    // In findOne({ _id, userId }), if userId matches, it returns session. If not, it returns null.
    // So if we mock findOne to return null when called with ANY arguments (default),
    // it simulates "not found for this user".
    // But to verify it CALLED with correct arguments, we check the call.

    // We want to ensure it calls findOne with userId: user123.
    // If someone passes chat: 'session-other' (which belongs to user-other),
    // the query will be { _id: 'session-other', userId: 'user123' }.
    // This query will return null (because that doc doesn't match both fields).
    // So create() will be called for a NEW session.

    const mockReq = {
        json: async () => ({ prompt: 'test', chat: 'session-other' })
    } as unknown as Request;

    await POST(mockReq);

    // Verify findOne was called with correct constraints
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'session-other', userId: 'user123' });

    // Verify it fell back to creating a new session (since findOne returned null by default)
    expect(mockCreate).toHaveBeenCalled();
  });
});
