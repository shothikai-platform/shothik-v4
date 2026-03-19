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
    json: vi.fn((data, options) => ({
      data,
      options,
      status: options?.status || 200,
      json: async () => data,
    })),
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
    // Mock that the chat exists so it would have been deleted if not for auth check
    mockFindByIdAndDelete.mockResolvedValue({ _id: 'chat1' });

    const response = await DELETE(
      new Request('http://localhost/api/research/chat/delete_chat/chat1', { method: 'DELETE' }),
      { params: Promise.resolve({ id: 'chat1' }) }
    ) as any;

    // Current insecure behavior: 200
    // Desired secure behavior: 401
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // In the insecure version, findByIdAndDelete('chat1') is called.
    // If it returns a chat, the response is 200.
    mockFindByIdAndDelete.mockResolvedValue({ _id: 'chat1', userId: 'user2' });

    // In the secure version, findOneAndDelete({ _id: 'chat1', userId: 'user1' }) will be called.
    // If it returns null, the response is 404.
    mockFindOneAndDelete.mockResolvedValue(null);

    const response = await DELETE(
      new Request('http://localhost/api/research/chat/delete_chat/chat1', { method: 'DELETE' }),
      { params: Promise.resolve({ id: 'chat1' }) }
    ) as any;

    // Current insecure behavior: 200
    // Desired secure behavior: 404
    expect(response.status).toBe(404);
  });
});
