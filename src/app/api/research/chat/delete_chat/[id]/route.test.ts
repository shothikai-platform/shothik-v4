import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
    json: vi.fn((data, options) => ({ data, status: options?.status || 200 })),
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    // In the vulnerable code, findByIdAndDelete is called regardless of auth.
    // If we mock it to return something, it would return 200.
    // This test asserts the secure behavior (401).
    // So it should FAIL currently because the code returns 200 (assuming findByIdAndDelete returns something).
    mockFindByIdAndDelete.mockResolvedValue({ _id: 'chat1' });

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat1', { method: 'DELETE' }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // Current behavior: 200 (if chat exists)
    // Desired behavior: 401
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user (unauthorized)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2', id: 'user2' });

    // The secure implementation should use findOneAndDelete with userId filter.
    // The vulnerable implementation uses findByIdAndDelete which ignores userId.

    // Scenario: Chat belongs to user1. Request is from user2.
    // Vulnerable code calls findByIdAndDelete('chat1') -> Returns chat -> 200 OK (Deleted!)
    // Secure code calls findOneAndDelete({ _id: 'chat1', userId: 'user2' }) -> Returns null -> 404 Not Found.

    mockFindByIdAndDelete.mockResolvedValue({ _id: 'chat1', userId: 'user1' });
    mockFindOneAndDelete.mockResolvedValue(null);

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat1', { method: 'DELETE' }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // Current behavior: 200 (Deleted!)
    // Desired behavior: 404 (Not Found/Unauthorized)
    expect(response.status).toBe(404);
  });

  it('should delete chat if user is owner', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1', id: 'user1' });

    // Secure implementation: findOneAndDelete({ _id: 'chat1', userId: 'user1' }) -> returns chat.
    mockFindOneAndDelete.mockResolvedValue({ _id: 'chat1', userId: 'user1' });

    // Vulnerable implementation: findByIdAndDelete('chat1') -> returns chat.
    mockFindByIdAndDelete.mockResolvedValue({ _id: 'chat1', userId: 'user1' });

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat1', { method: 'DELETE' }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(200);
    // In secure implementation, we expect findOneAndDelete to have been called.
    // expect(mockFindOneAndDelete).toHaveBeenCalled();
  });
});
