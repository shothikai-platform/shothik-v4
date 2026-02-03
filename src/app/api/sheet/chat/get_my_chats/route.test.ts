import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import SheetSession from '@/models/SheetSession';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/SheetSession', () => ({
  default: {
    find: vi.fn(),
  },
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, status: options?.status || 200 })),
  },
}));

describe('GET /api/sheet/chat/get_my_chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    expect(response.status).toBe(401);
    expect(response.data).toEqual({ error: 'Unauthorized' });
  });

  it('should fetch ONLY user sessions with optimization', async () => {
    // Setup mock chain
    const mockLean = vi.fn().mockResolvedValue(['session1', 'session2']);
    const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
    const mockSelect = vi.fn().mockReturnValue({ sort: mockSort });

    // We expect the chain to be: find({ userId: ... }).select('-__v').sort(...).lean()
    // OR find({ userId: ... }).select(...).sort(...) if lean is not last, but typically it is.
    // Let's assume standard Mongoose chaining.

    (SheetSession.find as any).mockReturnValue({
      select: mockSelect,
    });

    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    const response = await GET(new Request('http://localhost/api/sheet/chat/get_my_chats'));

    // Verify correct calls
    expect(getAuthenticatedUser).toHaveBeenCalled();
    expect(SheetSession.find).toHaveBeenCalledWith({ userId: 'user123' });
    expect(mockSelect).toHaveBeenCalledWith('-__v');
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLean).toHaveBeenCalled();

    expect(response.data).toEqual(['session1', 'session2']);
  });
});
