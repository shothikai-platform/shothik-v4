
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';

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
    json: vi.fn((data, options) => ({
        data,
        options,
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

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat1', { method: 'DELETE' }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

    // In the secure implementation, findOneAndDelete({ _id: id, userId: user._id }) will be called.
    // If the code is insecure, it will call findByIdAndDelete and return 200.

    mockFindOneAndDelete.mockResolvedValue(null);
    mockFindByIdAndDelete.mockResolvedValue({ _id: 'chat1', userId: 'user1' });

    const response = await DELETE(
        new Request('http://localhost/api/research/chat/delete_chat/chat1', { method: 'DELETE' }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(404);
  });

  it('should return 200 and delete chat if user owns it', async () => {
    const userId = 'user1';
    const chatId = 'chat1';
    (getAuthenticatedUser as any).mockResolvedValue({ _id: userId });

    mockFindOneAndDelete.mockResolvedValue({ _id: chatId, userId: userId });

    const response = await DELETE(
        new Request(`http://localhost/api/research/chat/delete_chat/${chatId}`, { method: 'DELETE' }),
        { params: Promise.resolve({ id: chatId }) }
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
