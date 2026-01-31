
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

  it('should verify authentication before deleting chat', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat123'),
        { params: Promise.resolve({ id: 'chat123' }) }
    );

    // Should return 401 if unauthenticated
    // Currently this will likely fail because it returns 200 (if logic is flawed) or 500
    expect(response.status).toBe(401);
  });

  it('should not delete chat belonging to another user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Mock findOneAndDelete to return null (simulating chat not found for this user)
    mockFindOneAndDelete.mockResolvedValue(null);

    // For current vulnerable implementation, it uses findByIdAndDelete
    // We mock it to return something, so if the code uses it, the test fails
    mockFindByIdAndDelete.mockResolvedValue({ _id: 'chat123' });

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat123'),
        { params: Promise.resolve({ id: 'chat123' }) }
    );

    // If vulnerability exists, findByIdAndDelete is called and succeeds (200)
    // We expect it to FAIL (404) because we want to enforce ownership check
    expect(response.status).toBe(404);

    // Verify findOneAndDelete was called with correct userId
    expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });

    // Verify findByIdAndDelete was NOT called
    expect(mockFindByIdAndDelete).not.toHaveBeenCalled();
  });
});
