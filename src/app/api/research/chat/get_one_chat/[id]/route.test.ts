import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import ResearchChat from '@/models/ResearchChat';
import * as ServerAuth from '@/lib/server-auth';

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
vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn((body, init) => ({
            status: init?.status || 200,
            json: () => Promise.resolve(body),
            body
        }))
    }
}));

describe('GET /api/research/chat/get_one_chat/[id]', () => {
  const mockParams = Promise.resolve({ id: 'chat-123' });
  const mockChat = {
    _id: 'chat-123',
    userId: 'user-123',
    name: 'Test Chat',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    // Mock unauthenticated user
    vi.spyOn(ServerAuth, 'getAuthenticatedUser').mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/research/chat/get_one_chat/chat-123');
    const response = await GET(request, { params: mockParams });

    expect(response.status).toBe(401);
    expect(ResearchChat.findOne).not.toHaveBeenCalled();
  });

  it('should prevent access to another user\'s chat (IDOR)', async () => {
    // Mock authenticated user (attacker)
    vi.spyOn(ServerAuth, 'getAuthenticatedUser').mockResolvedValue({ _id: 'attacker-456', name: 'Attacker', email: 'attacker@example.com' });

    // Mock findOne returning null because userId doesn't match
    (ResearchChat.findOne as any).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/research/chat/get_one_chat/chat-123');
    const response = await GET(request, { params: mockParams });

    expect(response.status).toBe(404);
    expect(ResearchChat.findOne).toHaveBeenCalledWith({ _id: 'chat-123', userId: 'attacker-456' });
  });

  it('should allow access to own chat', async () => {
    // Mock authenticated user (owner)
    vi.spyOn(ServerAuth, 'getAuthenticatedUser').mockResolvedValue({ _id: 'user-123', name: 'Owner', email: 'owner@example.com' });

    // Mock findOne returning the chat
    (ResearchChat.findOne as any).mockResolvedValue(mockChat);

    const request = new Request('http://localhost:3000/api/research/chat/get_one_chat/chat-123');
    const response = await GET(request, { params: mockParams });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data._id).toBe('chat-123');
    expect(ResearchChat.findOne).toHaveBeenCalledWith({ _id: 'chat-123', userId: 'user-123' });
  });
});
