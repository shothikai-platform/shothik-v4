import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findById: vi.fn(),
    },
  };
});

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn((body, init) => ({ body, status: init?.status || 200 })),
    },
  };
});

import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

describe('GET /api/research/chat/get_one_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prevents access to another user\'s chat (FIXED)', async () => {
    // Setup: User A is authenticated
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user-a-id' });

    // Setup: Chat belongs to User B
    const chatData = {
        _id: 'chat-id',
        userId: 'user-b-id',
        messages: []
    };
    (ResearchChat.findById as any).mockResolvedValue(chatData);

    const request = new Request('http://localhost/api/research/chat/get_one_chat/chat-id');
    const params = Promise.resolve({ id: 'chat-id' });

    const response = await GET(request, { params });

    // EXPECTATION: Should return 404 (Not Found) to avoid leaking existence
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Chat not found' });
  });

  it('allows access to own chat', async () => {
    // Setup: User A is authenticated
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user-a-id' });

    // Setup: Chat belongs to User A
    const chatData = {
        _id: 'chat-id',
        userId: 'user-a-id', // Matches user ID
        messages: []
    };
    (ResearchChat.findById as any).mockResolvedValue(chatData);

    const request = new Request('http://localhost/api/research/chat/get_one_chat/chat-id');
    const params = Promise.resolve({ id: 'chat-id' });

    const response = await GET(request, { params });

    // EXPECTATION: Should return 200 OK
    expect(response.status).toBe(200);
    expect(response.body).toEqual(chatData);
  });

  it('returns 401 if not authenticated', async () => {
    // Setup: No user authenticated
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/get_one_chat/chat-id');
    const params = Promise.resolve({ id: 'chat-id' });

    const response = await GET(request, { params });

    // EXPECTATION: Should return 401 Unauthorized
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
  });
});
