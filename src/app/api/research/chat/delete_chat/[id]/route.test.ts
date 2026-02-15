import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindByIdAndDelete, mockFindOneAndDelete } = vi.hoisted(() => {
  return {
    mockFindByIdAndDelete: vi.fn(),
    mockFindOneAndDelete: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findByIdAndDelete: mockFindByIdAndDelete,
      findOneAndDelete: mockFindOneAndDelete,
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

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat1', { method: 'DELETE' }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // Current behavior: The code does NOT check auth, so it will likely return 200 (if mockFindByIdAndDelete succeeds) or 404 (if it returns null).
    // We expect 401 for a secure implementation.
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

    // In insecure implementation, it uses findByIdAndDelete.
    mockFindByIdAndDelete.mockResolvedValue({ _id: 'chat1', userId: 'user1' });

    // In secure implementation, it uses findOneAndDelete.
    mockFindOneAndDelete.mockResolvedValue(null);

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat1', { method: 'DELETE' }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(404);

    // We also want to verify that findOneAndDelete was called with the correct query
    // But since this test is running against insecure code first, this assertion will fail.
    // That's okay, it confirms the vulnerability.
    expect(mockFindOneAndDelete).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'chat1',
        userId: 'user2'
    }));
  });

  it('should delete chat if user owns it', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    mockFindByIdAndDelete.mockResolvedValue({ _id: 'chat1', userId: 'user1' });
    mockFindOneAndDelete.mockResolvedValue({ _id: 'chat1', userId: 'user1' });

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat1', { method: 'DELETE' }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(200);
    expect(mockFindOneAndDelete).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'chat1',
        userId: 'user1'
    }));
  });
});
