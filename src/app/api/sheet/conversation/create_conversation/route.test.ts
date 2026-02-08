import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockSessionCreate, mockSessionFindById, mockSessionFindOne, mockSessionSave, mockConversationCreate, mockConversationSave } = vi.hoisted(() => {
  const sessionSave = vi.fn();
  const conversationSave = vi.fn();
  return {
    mockSessionCreate: vi.fn().mockResolvedValue({ _id: 'sessionNew', title: 'New', save: sessionSave }),
    mockSessionFindById: vi.fn(),
    mockSessionFindOne: vi.fn(),
    mockSessionSave: sessionSave,
    mockConversationCreate: vi.fn().mockResolvedValue({ _id: 'convNew', events: [], save: conversationSave }),
    mockConversationSave: conversationSave,
  };
});

// Mock Mongoose models
vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      create: mockSessionCreate,
      findById: mockSessionFindById,
      findOne: mockSessionFindOne,
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
// We mock the constructor behavior by mocking the class itself?
// Or we just inspect the calls.
// Since POST returns `new NextResponse(stream, ...)`
// We can just verify the logic before that.

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/sheet/conversation/create_conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test' })
    });

    const response = await POST(req);

    // Current behavior: 200 (Success, creates temp-user session)
    // Desired behavior: 401 (Unauthorized)
    expect(response.status).toBe(401);
  });

  it('should create session with authenticated user ID', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test' })
    });

    await POST(req);

    // Verify session creation
    // Current behavior: userId: 'temp-user'
    // Desired behavior: userId: 'user123'
    expect(mockSessionCreate).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123'
    }));
  });

  it('should verify ownership when accessing existing session', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'test', chat: 'sessionOld' })
    });

    // Mock finding session
    // Current code uses findById('sessionOld')
    // New code should use findOne({ _id: 'sessionOld', userId: 'user123' })

    // If the new code calls findOne, we should mock it to return the session
    mockSessionFindOne.mockResolvedValue({ _id: 'sessionOld', title: 'Old', save: mockSessionSave });

    // If the OLD code calls findById, we should mock it too?
    mockSessionFindById.mockResolvedValue({ _id: 'sessionOld', title: 'Old', save: mockSessionSave });

    await POST(req);

    // Verify correct query
    // Current behavior: findById
    // Desired behavior: findOne with userId
    expect(mockSessionFindOne).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'sessionOld',
        userId: 'user123'
    }));
  });
});
