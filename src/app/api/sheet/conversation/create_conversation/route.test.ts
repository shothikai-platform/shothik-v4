
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindById, mockFindOne, mockCreate, mockSave, mockSession } = vi.hoisted(() => {
  const save = vi.fn();
  return {
    mockFindById: vi.fn(),
    mockFindOne: vi.fn(),
    mockCreate: vi.fn(),
    mockSave: save,
    mockSession: { _id: 'session1', userId: 'user123', save, title: 'Old Title' }
  };
});

// Mock Mongoose models
vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      findById: mockFindById,
      findOne: mockFindOne,
      create: mockCreate,
    },
  };
});

vi.mock('@/models/SheetConversation', () => {
  return {
    default: {
      create: vi.fn().mockReturnValue({ _id: 'conv1', events: [], save: mockSave, response: {}, status: 'generating' }),
    },
  };
});

// Mock NextResponse
vi.mock('next/server', async () => {
  return {
    NextResponse: class {
        status: number;
        body: any;
        constructor(body: any, init?: any) {
            this.status = init?.status || 200;
            this.body = body;
        }
        static json(body: any, init?: any) {
            return { body, status: init?.status || 200 };
        }
    }
  };
});

import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';

describe('POST /api/sheet/conversation/create_conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSave.mockResolvedValue({});
    mockCreate.mockResolvedValue({ _id: 'sessionNew', userId: 'user123', save: mockSave, title: 'New Sheet' });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test' }),
    });

    const response: any = await POST(request);

    // Currently vulnerable: returns 200 (stream)
    // Expected secure: 401
    expect(response.status).toBe(401);
  });

  it('should use authenticated user id when creating session', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test' }),
    });

    await POST(request);

    // Currently vulnerable: uses 'temp-user'
    // Expected secure: uses 'user123'
    expect(SheetSession.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123'
    }));
  });

  it('should fail or create new session if user does not own the requested session', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Session belongs to 'otherUser', so findOne with userId='user123' returns null
    mockFindOne.mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test', chat: 'session1' }),
    });

    const response: any = await POST(request);

    // Currently vulnerable: updates otherUserSession
    // Expected secure: 403 Forbidden OR 404 Not Found OR create new session
    // We expect a 404 Not Found (or 403 Forbidden) to prevent IDOR and not reveal existence
    expect([403, 404]).toContain(response.status);
  });
});
