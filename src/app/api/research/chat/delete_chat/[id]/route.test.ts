
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
      findByIdAndDelete: vi.fn(),
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
        new Request('http://localhost/api/research/chat/delete_chat/123', {
            method: 'DELETE'
        }),
        { params: Promise.resolve({ id: '123' }) }
    );

    expect(response.status).toBe(401);
  });

  it('should enforce IDOR protection by scoping delete to userId', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOneAndDelete.mockResolvedValue({ _id: 'chat456' });

    await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat456', {
            method: 'DELETE'
        }),
        { params: Promise.resolve({ id: 'chat456' }) }
    );

    expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: 'chat456', userId: 'user123' });
    expect(ResearchChat.findByIdAndDelete).not.toHaveBeenCalled();
  });
});
