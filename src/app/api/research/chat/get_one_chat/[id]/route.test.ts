
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock Mongoose model
const { mockFindById, mockFindOne } = vi.hoisted(() => {
  return {
    mockFindById: vi.fn(),
    mockFindOne: vi.fn(),
  };
});

vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findById: mockFindById,
      findOne: mockFindOne,
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
  },
}));

describe('GET /api/research/chat/get_one_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);
    const params = Promise.resolve({ id: 'chat123' });
    const response = await GET(new Request('http://localhost/api/research/chat/get_one_chat/chat123'), { params });

    expect(response.status).toBe(401);
  });

  it('should fetch chat securely ensuring ownership', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOne.mockResolvedValue({ _id: 'chat123', userId: 'user123' });

    const params = Promise.resolve({ id: 'chat123' });
    await GET(new Request('http://localhost/api/research/chat/get_one_chat/chat123'), { params });

    // Expect findOne to be called with both id and userId
    expect(mockFindOne).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });
    // Expect findById NOT to be called (as it's insecure here)
    expect(mockFindById).not.toHaveBeenCalled();
  });
});
