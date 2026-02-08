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

const { mockFind } = vi.hoisted(() => {
  return {
    mockFind: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/SheetSession', () => {
  const mockLean = vi.fn().mockResolvedValue([]);
  const mockSort = vi.fn().mockReturnValue({ lean: mockLean }); // Chainable sort returns object with lean
  mockFind.mockReturnValue({ sort: mockSort });
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
import SheetSession from '@/models/SheetSession';

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
  });

  it('should return 200 and filter by userId if authenticated', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Setup find chain
    const mockLean = vi.fn().mockResolvedValue([]);
    const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
    mockFind.mockReturnValue({ sort: mockSort });

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(200);

    // Verify it called find with userId filter
    expect(mockFind).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user123' }));
  });
});
