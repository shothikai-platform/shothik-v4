
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Hoist mocks
const { mockFind, mockSort, mockLean } = vi.hoisted(() => {
  return {
    mockFind: vi.fn(),
    mockSort: vi.fn(),
    mockLean: vi.fn(),
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

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock chain
    mockLean.mockResolvedValue([{ _id: 'session1', title: 'Sheet 1' }]);

    // Allow sort to be called, and return object with lean (for optimized path)
    // AND allow it to resolve (for unoptimized path which awaits sort directly)
    mockSort.mockReturnValue({
        lean: mockLean,
        then: (resolve: any) => resolve([{ _id: 'session1', title: 'Sheet 1' }]) // Allow await on sort() directly
    });

    mockFind.mockReturnValue({
        sort: mockSort
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
  });

  it('should fetch sessions filtered by user and use lean()', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Expect filtering by userId
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });

    // Expect sorting
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });

    // Expect lean() for performance
    expect(mockLean).toHaveBeenCalled();
  });
});
