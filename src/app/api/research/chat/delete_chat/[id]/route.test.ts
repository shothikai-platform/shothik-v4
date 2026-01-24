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
      findByIdAndDelete: vi.fn(), // We expect this to NOT be used after fix
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

    const params = Promise.resolve({ id: 'chat123' });
    const response = await DELETE(new Request('http://localhost/api/research/chat/delete_chat/chat123'), { params });

    expect(response.status).toBe(401);
  });

  it('should delete chat if it belongs to user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockFindOneAndDelete.mockResolvedValue({ _id: 'chat123', userId: 'user123' });

    const params = Promise.resolve({ id: 'chat123' });
    const response = await DELETE(new Request('http://localhost/api/research/chat/delete_chat/chat123'), { params });

    expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user123' });
    expect(response.status).toBe(200);
  });
});
