
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
import ResearchChat from '@/models/ResearchChat';

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);
    mockFindByIdAndDelete.mockResolvedValue({ _id: 'chat1' }); // Insecure path would delete

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat1'),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // If insecure, it returns 200 (deleted).
    // We expect 401 (Unauthorized).
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user (IDOR)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

    // The db returns a chat belonging to user1 when findByIdAndDelete is called
    mockFindByIdAndDelete.mockResolvedValue({ _id: 'chat1', userId: 'user1' });

    // When secure, findOneAndDelete should be called with user2 scope
    mockFindOneAndDelete.mockResolvedValue(null); // Not found for user2

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat1'),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // If insecure, it returns 200 (deleted via findByIdAndDelete).
    // We expect 404 (Not Found via findOneAndDelete).
    expect(response.status).toBe(404);
  });

  it('should return 200 and delete chat if user owns it', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // In secure implementation, findOneAndDelete returns the chat
    mockFindOneAndDelete.mockResolvedValue({ _id: 'chat1', userId: 'user1' });

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat1'),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(200);
    // Verify findOneAndDelete was called with correct args
    expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: 'chat1', userId: 'user1' });
  });
});
