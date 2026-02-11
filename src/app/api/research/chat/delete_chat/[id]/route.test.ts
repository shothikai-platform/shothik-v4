import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';

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

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  const mockParams = Promise.resolve({ id: 'chat123' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await DELETE(new Request('http://localhost/api/research/chat/delete_chat/chat123', { method: 'DELETE' }), { params: mockParams });

    // Currently this will FAIL because there is no auth check
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat is not found or not owned by user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Mock findOneAndDelete to return null (chat not found for this user)
    mockFindOneAndDelete.mockResolvedValue(null);
    // Mock findByIdAndDelete just in case (to show it's currently used)
    mockFindByIdAndDelete.mockResolvedValue({ _id: 'chat123', userId: 'otherUser' });

    const response = await DELETE(new Request('http://localhost/api/research/chat/delete_chat/chat123', { method: 'DELETE' }), { params: mockParams });

    // Currently this will return 200 because it uses findByIdAndDelete and ignores ownership
    // We expect it to be 404 after fix
    expect(response.status).toBe(404);

    // Verify findOneAndDelete was called with correct params
    expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });
  });

  it('should successfully delete chat if user owns it', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockFindOneAndDelete.mockResolvedValue({ _id: 'chat123', userId: 'user123' });

    const response = await DELETE(new Request('http://localhost/api/research/chat/delete_chat/chat123', { method: 'DELETE' }), { params: mockParams });

    expect(response.status).toBe(200);
    expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });
  });
});
