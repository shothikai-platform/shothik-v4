import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindById, mockFindOne, mockLean } = vi.hoisted(() => {
  const lean = vi.fn();
  const findOne = vi.fn(() => ({ lean }));
  return {
    mockFindById: vi.fn(),
    mockFindOne: findOne,
    mockLean: lean,
  };
});

// Mock Mongoose model
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

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('GET /api/research/chat/get_one_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);
    mockFindById.mockResolvedValue({ _id: 'chat1', userId: 'user1', name: 'Chat 1' });

    const response = await GET(
        new Request('http://localhost/api/research/chat/get_one_chat/chat1'),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect((response as any).status).toBe(401);
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

    mockFindById.mockResolvedValue({ _id: 'chat1', userId: 'user1', name: 'Chat 1' });
    mockLean.mockResolvedValue(null);

    const response = await GET(
        new Request('http://localhost/api/research/chat/get_one_chat/chat1'),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect((response as any).status).toBe(404);
  });
});
