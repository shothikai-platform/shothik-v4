import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

// Hoist mock functions so they can be used in vi.mock
const { mockFind, mockSelect, mockSort, mockLean } = vi.hoisted(() => {
  return {
    mockFind: vi.fn(),
    mockSelect: vi.fn(),
    mockSort: vi.fn(),
    mockLean: vi.fn(),
  };
});

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

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

// Import after mocks
import { GET } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock chain
    // Default behavior: find returns object with methods to chain
    mockFind.mockReturnValue({
      select: mockSelect,
      sort: mockSort,
      lean: mockLean
    });

    mockSelect.mockReturnValue({
      lean: mockLean,
      sort: mockSort
    });

    mockLean.mockReturnValue({
      sort: mockSort
    });

    mockSort.mockResolvedValue([{ _id: '1', title: 'Sheet 1' }]);
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
  });

  it('should fetch sessions filtered by userId and optimized', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(200);

    // Verify filtering by userId
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });

    // Verify optimizations
    expect(mockSelect).toHaveBeenCalledWith('-__v');
    expect(mockLean).toHaveBeenCalled();

    // Verify sort is called
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
  });
});
