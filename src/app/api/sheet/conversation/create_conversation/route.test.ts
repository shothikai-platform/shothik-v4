import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import SheetSession from '@/models/SheetSession';
import SheetConversation from '@/models/SheetConversation';

// Mock dependencies
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => ({
  default: {
    findById: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/models/SheetConversation', () => ({
  default: {
    create: vi.fn(),
  },
}));

// Mock NextResponse to avoid environment issues and make assertions easier
vi.mock('next/server', () => {
  const actual = vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: vi.fn((body, init) => ({
        status: init?.status || 200,
        body,
        json: async () => body,
      })),
      // Mock constructor for stream response
      // The real code does `new NextResponse(stream, init)`
      // We can make it a class
    },
  };
});

// Since we can't easily mock the class constructor with `vi.mock` return object for default export easily if it's named export
// Let's rely on the fact that `POST` returns something.

describe('POST /api/sheet/conversation/create_conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    // Setup: Unauthenticated
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' }),
    });

    const response = await POST(request);

    // Assertion: Should be 401
    // Note: The current implementation does NOT check auth, so this will fail (it will likely crash or return 200)
    // If it crashes because of mocks, we need to handle that.
    // If it returns 200, expect(response.status).toBe(401) will fail, which is what we want.
    expect(response.status).toBe(401);
  });

  it('should return 403 if trying to access another user session', async () => {
    // Setup: Authenticated as user1
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // Setup: Session belongs to user2
    (SheetSession.findById as any).mockResolvedValue({
      _id: 'session1',
      userId: 'user2',
      save: vi.fn(),
    });

    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test', chat: 'session1' }),
    });

    const response = await POST(request);

    // Assertion: Should be 403 Forbidden
    expect(response.status).toBe(403);
  });

  it('should create session with correct user ID if authenticated', async () => {
    // Setup: Authenticated as user1
    const userId = 'user1';
    (getAuthenticatedUser as any).mockResolvedValue({ _id: userId });

    // Setup: No existing session (new chat)
    const request = new Request('http://localhost/api/sheet/conversation/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' }),
    });

    // We need to mock SheetSession.create to return a session
    const mockSession = { _id: 'new_session', userId, title: 'test', save: vi.fn() };
    (SheetSession.create as any).mockResolvedValue(mockSession);

    // We need to mock SheetConversation.create
    const mockConversation = {
        _id: 'conv1',
        status: 'generating',
        events: [],
        save: vi.fn()
    };
    (SheetConversation.create as any).mockResolvedValue(mockConversation);

    // We are not mocking NextResponse constructor, so it will use the real one or the one from next/server if available.
    // If `next/server` mock above is used, we need to make sure `new NextResponse()` works.
    // The mock above only defined `json`.
    // Let's adjust the mock later if needed. For now, let's assume valid execution path.

    // To properly test the "happy path" with the stream, we might need to mock NextResponse class completely.
    // But verifying 401/403 is enough for security fix verification.

    // For this test, we just want to verify `SheetSession.create` was called with correct `userId`.
    try {
        await POST(request);
    } catch (e) {
        // Ignore errors from stream creation or NextResponse
    }

    expect(SheetSession.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: userId
    }));
  });
});
