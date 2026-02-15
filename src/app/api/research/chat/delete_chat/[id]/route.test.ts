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
    mockFindByIdAndDelete.mockResolvedValue({ _id: 'chat1', userId: 'user1' });

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat1'),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // Current behavior: 200 (Success)
    // Desired behavior: 401 (Unauthorized)
    expect(response.status).toBe(401);
  });

  it('should not delete chat if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);
    mockFindByIdAndDelete.mockResolvedValue({ _id: 'chat1', userId: 'user1' });

    await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat1'),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // Should NOT call delete methods if unauthenticated
    expect(mockFindByIdAndDelete).not.toHaveBeenCalled();
    expect(mockFindOneAndDelete).not.toHaveBeenCalled();
  });

  it('should return 404/403 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

    // The db returns a chat belonging to user1 IF using findByIdAndDelete
    mockFindByIdAndDelete.mockResolvedValue({ _id: 'chat1', userId: 'user1' });

    // Using findOneAndDelete({ _id: id, userId: user2 }) -> returns null (not found for this user)
    mockFindOneAndDelete.mockResolvedValue(null);

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat1'),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // Current behavior: 200 (Success) because it uses findByIdAndDelete
    // Desired behavior: 404 (Not Found via findOneAndDelete)
    expect(response.status).toBe(404);
  });

  it('should only use findOneAndDelete with correct userId', async () => {
    const user = { _id: 'user1' };
    (getAuthenticatedUser as any).mockResolvedValue(user);
    mockFindOneAndDelete.mockResolvedValue({ _id: 'chat1', userId: 'user1' });

    await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat1'),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // Should call findOneAndDelete with both ID and userId
    expect(mockFindOneAndDelete).toHaveBeenCalledWith(expect.objectContaining({
      _id: 'chat1',
      userId: 'user1'
    }));
    // Should NOT call unsafe findByIdAndDelete
    expect(mockFindByIdAndDelete).not.toHaveBeenCalled();
  });
});
