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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await DELETE(
      new Request('http://localhost/api/research/chat/delete_chat/chat1'),
      { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(401);
    expect((response as any).data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 404 if chat belongs to another user or does not exist', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });
    mockFindOneAndDelete.mockResolvedValue(null);

    const response = await DELETE(
      new Request('http://localhost/api/research/chat/delete_chat/chat1'),
      { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(mockFindOneAndDelete).toHaveBeenCalledWith({
      _id: 'chat1',
      userId: 'user2',
    });
    expect(response.status).toBe(404);
    expect((response as any).data).toEqual({ error: 'Chat not found' });
  });

  it('should return 200 and success: true if deletion succeeds', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOneAndDelete.mockResolvedValue({ _id: 'chat1', userId: 'user1' });

    const response = await DELETE(
      new Request('http://localhost/api/research/chat/delete_chat/chat1'),
      { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(mockFindOneAndDelete).toHaveBeenCalledWith({
      _id: 'chat1',
      userId: 'user1',
    });
    expect(response.status).toBe(200);
    expect((response as any).data).toEqual({ success: true });
  });

  it('should return 500 with a generic error message on db error to prevent info leakage', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOneAndDelete.mockRejectedValue(new Error('Sensitive database internals leaked!'));

    const response = await DELETE(
      new Request('http://localhost/api/research/chat/delete_chat/chat1'),
      { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(500);
    expect((response as any).data).toEqual({ error: 'Failed to delete chat' });
  });
});
