import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindById, mockCreateSession, mockSaveSession, mockCreateConversation, mockSaveConversation } = vi.hoisted(() => {
  return {
    mockFindById: vi.fn(),
    mockCreateSession: vi.fn(),
    mockSaveSession: vi.fn(),
    mockCreateConversation: vi.fn(),
    mockSaveConversation: vi.fn(),
  };
});

// Mock Mongoose models
vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      findById: mockFindById,
      create: mockCreateSession,
    },
  };
});

vi.mock('@/models/SheetConversation', () => {
  return {
    default: {
      create: mockCreateConversation,
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => {
  const MockNextResponse = vi.fn(function(this: any, body, options) {
      this.body = body;
      this.options = options;
      this.status = options?.status || 200;
      return this;
  });
  (MockNextResponse as any).json = vi.fn((data, options) => ({ data, options, status: options?.status || 200 }));
  return { NextResponse: MockNextResponse };
});


import { getAuthenticatedUser } from '@/lib/server-auth';
// import SheetSession from '@/models/SheetSession'; // Not needed if we use mocks directly
// import SheetConversation from '@/models/SheetConversation';

describe('POST /api/sheet/conversation/create_conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks return values
    // We need to return an object that has .save()
    const mockSessionInstance = { _id: 'session1', save: vi.fn() };
    mockCreateSession.mockResolvedValue(mockSessionInstance);
    mockFindById.mockResolvedValue(mockSessionInstance);

    const mockConversationInstance = { _id: 'conv1', events: [], save: vi.fn() };
    mockCreateConversation.mockResolvedValue(mockConversationInstance);
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Test prompt' })
    });

    const response = await POST(req);

    // Currently fails (returns 200/stream). Expect 401 after fix.
    expect((response as any).status).toBe(401);
  });

  it('should create a session with the authenticated user ID', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const req = new Request('http://localhost/api/sheet/conversation/create_conversation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Test prompt' })
    });

    await POST(req);

    // Check that SheetSession.create was called with correct userId
    expect(mockCreateSession).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123',
        title: expect.stringContaining('Test prompt')
    }));
  });
});
