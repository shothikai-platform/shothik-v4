
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
      findByIdAndDelete: vi.fn(),
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
        json: async () => data
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

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/123', { method: 'DELETE' }),
        { params: Promise.resolve({ id: '123' }) }
    );

    expect(response.status).toBe(401);
  });

  it('should use findOneAndDelete with userId for IDOR protection', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOneAndDelete.mockResolvedValue({ _id: '123', userId: 'user123' });

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/123', { method: 'DELETE' }),
        { params: Promise.resolve({ id: '123' }) }
    );

    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({ _id: '123', userId: 'user123' });
    expect(response.status).toBe(200);
  });

  it('should return 404 if chat not found or does not belong to user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOneAndDelete.mockResolvedValue(null);

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/123', { method: 'DELETE' }),
        { params: Promise.resolve({ id: '123' }) }
    );

    expect(response.status).toBe(404);
  });
});
