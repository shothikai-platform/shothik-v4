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

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock chain
    mockFind.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ sort: mockSort });
    mockSort.mockReturnValue({ lean: mockLean });

    // Default return
    mockLean.mockResolvedValue([
        { _id: '1', title: 'Chat 1', status: 'active', createdAt: new Date() }
    ]);
  });

  it('should return 401 if not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
  });

  it('should fetch user-scoped chats with optimizations', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // 1. Verify Authentication Used
    expect(getAuthenticatedUser).toHaveBeenCalled();

    // 2. Verify Scoped Query
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });

    // 3. Verify Field Selection
    expect(mockSelect).toHaveBeenCalledWith('title status createdAt updatedAt');

    // 4. Verify Sorting
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });

    // 5. Verify Lean
    expect(mockLean).toHaveBeenCalled();

    // 6. Verify Name Mapping
    const responseData = (NextResponse.json as any).mock.calls[0][0];
    expect(responseData).toHaveLength(1);
    expect(responseData[0].name).toBe('Chat 1'); // mapped from title
  });

  it('should map undefined title to "Untitled Sheet"', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockLean.mockResolvedValue([
        { _id: '2', title: undefined, status: 'active' }
    ]);

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    const responseData = (NextResponse.json as any).mock.calls[0][0];
    expect(responseData[0].name).toBe('Untitled Sheet');
  });
});
