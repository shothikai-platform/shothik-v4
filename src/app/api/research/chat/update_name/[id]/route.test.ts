
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindByIdAndUpdate, mockFindOneAndUpdate } = vi.hoisted(() => {
  return {
    mockFindByIdAndUpdate: vi.fn(),
    mockFindOneAndUpdate: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findByIdAndUpdate: mockFindByIdAndUpdate,
      findOneAndUpdate: mockFindOneAndUpdate,
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

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user1', name: 'New Name' });

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
    });

    const response = await PUT(
        request,
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

    // Simulate chat not found for this user (when using findOneAndUpdate)
    mockFindOneAndUpdate.mockResolvedValue(null);

    // Mock findByIdAndUpdate to return something to simulate insecure behavior if it was called
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user1', name: 'Chat 1' });

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
    });

    const response = await PUT(
        request,
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(404);
  });

  it('should return 200 and update chat if user is authorized', async () => {
    const userId = 'user1';
    const chatId = 'chat1';
    const newName = 'My Research';

    (getAuthenticatedUser as any).mockResolvedValue({ _id: userId });

    const updatedChat = { _id: chatId, userId: userId, name: newName };
    mockFindOneAndUpdate.mockResolvedValue(updatedChat);

    const request = new Request(`http://localhost/api/research/chat/update_name/${chatId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: newName })
    });

    const response = await PUT(
        request,
        { params: Promise.resolve({ id: chatId }) }
    );

    expect(response.status).toBe(200);
    // Verify findOneAndUpdate was called with correct filter (including userId)
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ _id: chatId, userId: userId }),
        expect.objectContaining({ name: newName }),
        expect.any(Object)
    );
  });
});
