
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

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
    mockLean.mockResolvedValue([{ _id: '1', title: 'Sheet 1' }]);
    mockSort.mockReturnValue({ lean: mockLean });
    mockSelect.mockReturnValue({ sort: mockSort });

    // Default behavior for find: return object with select (and sort for backward compatibility if needed,
    // but the test will enforce select usage)
    mockFind.mockReturnValue({
        sort: mockSort,
        select: mockSelect
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
  });

  it('should fetch chats with messages excluded for performance', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Verify user scoping
    expect(mockFind).toHaveBeenCalledWith({ userId: 'user123' });

    // Verify sort is called
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });

    // Verify select is called (optimization)
    // The exact fields should match what's needed: title, status, updatedAt, createdAt
    expect(mockSelect).toHaveBeenCalledWith('title status updatedAt createdAt');

    // Verify lean is called (optimization)
    expect(mockLean).toHaveBeenCalled();
  });
});
