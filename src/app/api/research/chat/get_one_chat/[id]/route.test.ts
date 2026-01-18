import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Hoist mocks
const { mockFindById, mockFindOne, mockGetAuthenticatedUser } = vi.hoisted(() => {
  return {
    mockFindById: vi.fn(),
    mockFindOne: vi.fn(),
    mockGetAuthenticatedUser: vi.fn(),
  }
})

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

// Mock ResearchChat model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findById: mockFindById,
      findOne: mockFindOne,
    },
  };
});

// Mock server-auth
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: mockGetAuthenticatedUser,
}));

// Mock NextResponse
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn((body, init) => ({
        json: async () => body,
        status: init?.status || 200,
      })),
    },
  };
});

describe('GET /api/research/chat/get_one_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);
    mockFindById.mockResolvedValue({ _id: 'chat-123', userId: 'user-456' });

    const request = new Request('http://localhost/api/research/chat/get_one_chat/chat-123');
    const params = Promise.resolve({ id: 'chat-123' });

    const response = await GET(request, { params });

    expect(response.status).toBe(401);
  });

  it('should return 404 if user is authenticated but does not own the chat', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ _id: 'user-789' }); // Different user
    mockFindById.mockResolvedValue({ _id: 'chat-123', userId: 'user-456' }); // Owned by 456
    mockFindOne.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/get_one_chat/chat-123');
    const params = Promise.resolve({ id: 'chat-123' });

    const response = await GET(request, { params });

    expect(response.status).toBe(404);
  });
});
