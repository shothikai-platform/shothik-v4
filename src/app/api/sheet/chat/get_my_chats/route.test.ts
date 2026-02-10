import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFind, mockSort } = vi.hoisted(() => {
  return {
    mockFind: vi.fn(),
    mockSort: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/SheetSession', () => {
  return {
    default: {
      find: mockFind,
    },
  };
});

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
  },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup generic mock chain
    mockSort.mockResolvedValue([{ _id: '1', title: 'Chat 1', userId: 'user123' }]);

    // Default behavior for find: return object with sort
    mockFind.mockReturnValue({
        sort: mockSort
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    // Mock request object
    const request = {
        json: async () => ({}),
    } as unknown as Request;

    const response = await GET(request);

    // This assertion will fail initially because the code returns 200
    expect(response.status).toBe(401);
  });

  it('should fetch chats for the authenticated user only', async () => {
    const mockUser = { _id: 'user123', id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Mock request object
    const request = {
        json: async () => ({}),
    } as unknown as Request;

    await GET(request);

    // This assertion will fail initially because the code calls find({})
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
  });
});
