import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock Mongoose model
const { mockFindById, mockFindOne, mockSave, mockFindByIdAndUpdate, mockFindOneAndUpdate } = vi.hoisted(() => {
  return {
    mockFindById: vi.fn(),
    mockFindOne: vi.fn(),
    mockSave: vi.fn(),
    mockFindByIdAndUpdate: vi.fn(),
    mockFindOneAndUpdate: vi.fn(),
  };
});

const mockChat = {
    _id: 'chat123',
    userId: 'user123',
    messages: [],
    save: mockSave,
};

vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findById: mockFindById,
      findOne: mockFindOne,
      findByIdAndUpdate: mockFindByIdAndUpdate,
      findOneAndUpdate: mockFindOneAndUpdate,
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => {
    return {
        NextResponse: class {
            constructor(body: any, options: any) {
                return { body, options, status: options?.status || 200 };
            }
            static json(data: any, options: any) {
                return { data, options, status: options?.status || 200 };
            }
        }
    };
});

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/research/research/create_research_queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindById.mockResolvedValue(mockChat);
    mockFindOne.mockResolvedValue(mockChat);
    mockFindByIdAndUpdate.mockResolvedValue(mockChat);
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const req = new Request('http://localhost/api', {
        method: 'POST',
        body: JSON.stringify({ chat: 'chat123', query: 'test' })
    });

    const response = await POST(req);
    // Cast response to any because our mock returns a plain object
    expect((response as any).status).toBe(401);
  });

  it('should return 404 if chat is not found or not owned by user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    // Simulate IDOR scenario:
    // findById (current vulnerable code) would find the chat even if owned by someone else.
    // findOne (secure code) will not find it if we ensure it returns null for mismatch.

    // For this test to fail on current code (proving vulnerability) and pass on new code:
    // We mock findById to return a chat (simulating existing chat).
    // We mock findOne to return null (simulating "not found for this user").

    mockFindById.mockResolvedValue({ ...mockChat, userId: 'otherUser' });
    mockFindOne.mockResolvedValue(null);

    const req = new Request('http://localhost/api', {
        method: 'POST',
        body: JSON.stringify({ chat: 'chat123', query: 'test' })
    });

    const response = await POST(req);
    expect((response as any).status).toBe(404);
  });
});
