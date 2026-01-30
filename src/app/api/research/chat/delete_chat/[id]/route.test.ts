
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

const { mockFindOneAndDelete } = vi.hoisted(() => {
  return {
    mockFindOneAndDelete: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
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
  const mockParams = Promise.resolve({ id: 'chat123' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await DELETE(new Request('http://localhost/api'), { params: mockParams });

    expect(response.status).toBe(401);
  });

  it('should delete chat if found and owned by user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOneAndDelete.mockResolvedValue({ _id: 'chat123' });

    const response = await DELETE(new Request('http://localhost/api'), { params: mockParams });

    expect(getAuthenticatedUser).toHaveBeenCalled();
    expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });
    expect(response.status).toBe(200);
    expect((response as any).data).toEqual({ success: true });
  });

  it('should return 404 if chat not found or not owned by user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOneAndDelete.mockResolvedValue(null);

    const response = await DELETE(new Request('http://localhost/api'), { params: mockParams });

    expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });
    expect(response.status).toBe(404);
  });
});
