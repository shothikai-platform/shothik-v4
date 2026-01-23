import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Hoist mocks so they can be used in vi.mock factories
const mocks = vi.hoisted(() => ({
  findOne: vi.fn(),
  findById: vi.fn(),
  getAuthenticatedUser: vi.fn(),
}));

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

// Mock ResearchChat model
vi.mock('@/models/ResearchChat', () => ({
  default: {
    findOne: mocks.findOne,
    findById: mocks.findById,
  },
}));

// Mock server-auth
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
}));

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({
        body,
        status: init?.status || 200,
        json: async () => body
    })),
  },
}));

describe('GET /api/research/chat/get_one_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should deny access if user does not own the chat (IDOR check)', async () => {
    // Setup
    const chatId = 'chat-123';
    const userId = 'user-123';
    const otherUserId = 'user-456';

    // Mock authenticated user
    mocks.getAuthenticatedUser.mockResolvedValue({ _id: userId });

    // Mock chat existing but owned by someone else
    // current vulnerable code uses findById
    mocks.findById.mockResolvedValue({
      _id: chatId,
      userId: otherUserId,
      name: 'Secret Chat',
    });

    // correct code will use findOne
    mocks.findOne.mockResolvedValue(null);

    const request = new Request(`http://localhost/api/research/chat/get_one_chat/${chatId}`);
    const params = Promise.resolve({ id: chatId });

    // Execute
    const response = await GET(request, { params });

    // Assert
    // Current vulnerable code returns 200 because it finds the chat via findById
    // Secure code should return 404 (acting as if it doesn't exist)
    expect(response.status).toBe(404);
  });

  it('should allow access if user owns the chat', async () => {
    // Setup
    const chatId = 'chat-123';
    const userId = 'user-123';

    // Mock authenticated user
    mocks.getAuthenticatedUser.mockResolvedValue({ _id: userId });

    // Mock chat existing and owned by user
    const mockChat = {
      _id: chatId,
      userId: userId,
      name: 'My Chat',
    };
    mocks.findOne.mockResolvedValue(mockChat);

    const request = new Request(`http://localhost/api/research/chat/get_one_chat/${chatId}`);
    const params = Promise.resolve({ id: chatId });

    // Execute
    const response = await GET(request, { params });
    const body = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(body).toEqual(mockChat);
    // Since we mock findOne, we check arguments are correct
    // Note: Vitest mocks capture arguments, but we need to check if they were called
    // We can't strictly check deep equality of objects in toHaveBeenCalledWith if we didn't setup matcher,
    // but here we passed an object literal in the code: { _id: id, userId: ... }
    // Let's rely on status 200 and body match for now.

    // Actually we can check calls
    expect(mocks.findOne).toHaveBeenCalled();
  });
});
