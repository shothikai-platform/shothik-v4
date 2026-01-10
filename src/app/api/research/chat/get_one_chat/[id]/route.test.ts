import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import ResearchChat from '@/models/ResearchChat';
import * as serverAuth from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findById: vi.fn(),
    findOne: vi.fn(),
  },
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: (body: any, options?: any) => {
        return {
          json: async () => body,
          status: options?.status || 200,
        };
      },
    },
  };
});

describe('GET /api/research/chat/get_one_chat/[id]', () => {
  const mockParams = Promise.resolve({ id: 'chat-123' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should deny access if user is not authenticated', async () => {
    // Setup
    (serverAuth.getAuthenticatedUser as any).mockResolvedValue(null);
    const req = new Request('http://localhost/api/research/chat/get_one_chat/chat-123');

    // Execute
    const response = await GET(req, { params: mockParams });

    // Verify
    expect(response.status).toBe(401);
  });

  it('should deny access if user does not own the chat', async () => {
    // Setup
    (serverAuth.getAuthenticatedUser as any).mockResolvedValue({ _id: 'user-1' });

    // Mock that the chat exists but belongs to user-2
    // The vulnerable code uses findById, so we mock that to return the chat
    (ResearchChat.findById as any).mockResolvedValue({
      _id: 'chat-123',
      userId: 'user-2', // Different user
      name: 'Secret Chat',
    });

    // The secure code will use findOne with userId filter, so we verify what happens.
    // If the code is fixed to use findOne, we should mock findOne to return null (since user-1 doesn't match user-2)
    (ResearchChat.findOne as any).mockResolvedValue(null);

    const req = new Request('http://localhost/api/research/chat/get_one_chat/chat-123');

    // Execute
    const response = await GET(req, { params: mockParams });

    // Verify
    // For IDOR, usually 403 or 404 is appropriate.
    // The vulnerable code will return 200.
    expect(response.status).not.toBe(200);
  });
});
