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

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ body, init })),
  },
}));

describe('GET /api/research/chat/get_one_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    // Setup
    vi.mocked(serverAuth.getAuthenticatedUser).mockResolvedValue(null);
    const params = Promise.resolve({ id: 'chat-123' });
    const request = new Request('http://localhost:3000/api/research/chat/get_one_chat/chat-123');

    // Execute
    const response = await GET(request, { params });

    // Assert
    // Currently the code doesn't check auth, so it might fail here or return 200/404.
    // We expect 401 after our fix.
    expect(response.init?.status).toBe(401);
  });

  it('should fetch chat with userId constraint', async () => {
    // Setup
    const mockUser = { _id: 'user-123', email: 'test@example.com', name: 'Test User' };
    vi.mocked(serverAuth.getAuthenticatedUser).mockResolvedValue(mockUser);

    // Mock findOne to return a chat
    const mockChat = { _id: 'chat-123', userId: 'user-123', name: 'My Chat' };
    vi.mocked(ResearchChat.findOne).mockResolvedValue(mockChat);

    const params = Promise.resolve({ id: 'chat-123' });
    const request = new Request('http://localhost:3000/api/research/chat/get_one_chat/chat-123');

    // Execute
    await GET(request, { params });

    // Assert
    expect(ResearchChat.findOne).toHaveBeenCalledWith({
      _id: 'chat-123',
      userId: 'user-123',
    });
    // Ensure findById is NOT called (which is the insecure way)
    expect(ResearchChat.findById).not.toHaveBeenCalled();
  });
});
