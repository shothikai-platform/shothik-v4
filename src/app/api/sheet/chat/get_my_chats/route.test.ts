
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFind, mockSelect, mockSort, mockLean } = vi.hoisted(() => {
  return {
    mockFind: vi.fn(),
    mockSelect: vi.fn(),
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

    // Setup generic mock chain
    // Chain: find -> select -> lean -> sort -> resolved value
    mockSort.mockResolvedValue([{ _id: '1', title: 'Chat 1' }]);
    mockLean.mockReturnValue({ sort: mockSort });
    mockSelect.mockReturnValue({ lean: mockLean });

    // Default behavior for find
    mockFind.mockReturnValue({
        select: mockSelect,
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
  });

  it('should fetch chats filtered by user and optimized', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Check filtering by user
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });

    // Check performance optimizations
    expect(mockSelect).toHaveBeenCalledWith('-__v');
    expect(mockLean).toHaveBeenCalled();

    // Check sorting
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
  });
});
