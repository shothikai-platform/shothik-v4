import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { NextResponse } from 'next/server';

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

vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findOneAndDelete: mockFindOneAndDelete,
    },
  };
});

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
        new Request('http://localhost/api/research/chat/delete_chat/chat1', { method: 'DELETE' }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(401);
    expect(response.data.error).toBe('Unauthorized');
  });

  it('should return 404 if chat belongs to another user or does not exist', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOneAndDelete.mockResolvedValue(null);

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat1', { method: 'DELETE' }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: 'chat1', userId: 'user1' });
    expect(response.status).toBe(404);
    expect(response.data.error).toBe('Chat not found');
  });

  it('should return 200 and success if chat belongs to user and is deleted', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOneAndDelete.mockResolvedValue({ _id: 'chat1', userId: 'user1' });

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat1', { method: 'DELETE' }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: 'chat1', userId: 'user1' });
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });
});
