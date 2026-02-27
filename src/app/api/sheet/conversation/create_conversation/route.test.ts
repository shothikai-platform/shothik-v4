
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

const { mockFindOne, mockCreate, mockSave, mockConversationCreate } = vi.hoisted(() => {
    return {
        mockFindOne: vi.fn(),
        mockCreate: vi.fn(),
        mockSave: vi.fn(),
        mockConversationCreate: vi.fn(),
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
        create: mockConversationCreate,
      },
    };
});

// Mock NextResponse
// We mock the constructor because the endpoint returns `new NextResponse(stream, ...)`
vi.mock('next/server', () => {
    return {
        NextResponse: class {
            constructor(body: any, init: any) {
                // @ts-ignore
                this.body = body;
                // @ts-ignore
                this.init = init;
                // @ts-ignore
                this.status = init?.status || 200;
            }
            static json(data: any, options: any) {
                return { data, options, status: options?.status || 200 };
            }
        }
    }
});


import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/sheet/conversation/create_conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConversationCreate.mockResolvedValue({
        _id: 'conv1',
        events: [],
        save: vi.fn(),
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response: any = await POST(new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
    }));

    expect(response.status).toBe(401);
  });

  it('should create a new session with correct userId if no chat provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockCreate.mockResolvedValue({ _id: 'session1', title: 'Test Prompt' });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Test Prompt' }),
    });

    await POST(request);

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123',
        title: 'Test Prompt',
    }));
  });

  it('should scope session lookup to userId when chat provided', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockSession = { _id: 'session1', title: 'Old Title', save: mockSave };
    mockFindOne.mockResolvedValue(mockSession);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'New Prompt', chat: 'session1' }),
    });

    await POST(request);

    // CRITICAL SECURITY ASSERTION: verify userId scoping
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'session1', userId: 'user123' });

    // Verify update
    expect(mockSession.title).toBe('New Prompt');
    expect(mockSave).toHaveBeenCalled();
  });

  it('should return 404 (Access Denied) if session exists but belongs to another user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Simulate not found (because userId won't match in real DB, so findOne returns null)
    mockFindOne.mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Hacking Attempt', chat: 'session_of_other_user' }),
    });

    const response: any = await POST(request);

    // Should create a new session if not found?
    // Wait, the logic in route.ts says:
    // if (chatId) { try { session = findOne(...) ... if (!session) return 404 } }

    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'session_of_other_user', userId: 'user123' });
    expect(response.status).toBe(404);
  });
});
