
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock Mongoose model
const { mockFindByIdAndDelete, mockFindOneAndDelete } = vi.hoisted(() => {
  return {
    mockFindByIdAndDelete: vi.fn(),
    mockFindOneAndDelete: vi.fn(),
  };
});

vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findByIdAndDelete: mockFindByIdAndDelete,
      findOneAndDelete: mockFindOneAndDelete,
    },
  };
});

// Mock NextResponse
// We return a simple object that mimics the response structure we care about (status)
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
        data,
        status: options?.status || 200,
        json: async () => data
    })),
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fail with 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const params = Promise.resolve({ id: 'chat123' });
    const request = new Request('http://localhost/api/research/chat/delete_chat/chat123', {
        method: 'DELETE'
    });

    // @ts-ignore - The mock return type is simplified
    const response = await DELETE(request, { params });

    // Currently this will fail (likely 200 or 500) because auth check is missing
    expect(response.status).toBe(401);
  });

  it('should prevent IDOR: fail with 404 if user tries to delete another user\'s chat', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Mock findOneAndDelete to return null (chat not found for this user)
    mockFindOneAndDelete.mockResolvedValue(null);

    const params = Promise.resolve({ id: 'chat_owned_by_other' });
    const request = new Request('http://localhost/api/research/chat/delete_chat/chat_owned_by_other', {
        method: 'DELETE'
    });

    // @ts-ignore
    const response = await DELETE(request, { params });

    // This assertion checks if the secure method was called
    expect(mockFindOneAndDelete).toHaveBeenCalledWith({
        _id: 'chat_owned_by_other',
        userId: 'user123'
    });

    expect(response.status).toBe(404);
  });

  it('should succeed if user owns the chat', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Mock successful deletion
    mockFindOneAndDelete.mockResolvedValue({ _id: 'chat123', userId: 'user123' });

    const params = Promise.resolve({ id: 'chat123' });
    const request = new Request('http://localhost/api/research/chat/delete_chat/chat123', {
        method: 'DELETE'
    });

    // @ts-ignore
    const response = await DELETE(request, { params });

    expect(mockFindOneAndDelete).toHaveBeenCalledWith({
        _id: 'chat123',
        userId: 'user123'
    });

    expect(response.status).toBe(200);
  });
});
