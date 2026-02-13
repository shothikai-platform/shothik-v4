
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

  it('should return 401 if user is not authenticated (Security Fix Verification)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat1'),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // If insecure, this will likely be 200 or 404 (if mock returns null)
    // We want it to be 401.
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user (Security Fix Verification)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

    // Mocking findOneAndDelete to return null (meaning not found for THIS user)
    mockFindOneAndDelete.mockResolvedValue(null);
    // If it's still using findByIdAndDelete, we might need to mock that too to see it being called incorrectly
    mockFindByIdAndDelete.mockResolvedValue({ _id: 'chat1', userId: 'user1' });

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat1'),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // If insecure, it would delete user1's chat and return 200.
    // If secure, it should return 404.
    expect(response.status).toBe(404);
  });
});
