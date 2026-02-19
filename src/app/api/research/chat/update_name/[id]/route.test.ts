
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
import ResearchChat from '@/models/ResearchChat';

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user1', name: 'Updated Name' });

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name' })
    });

    const response = await PUT(
        request,
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // Current behavior: 200 (insecure)
    // Desired behavior: 401
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' }); // Different user

    // In secure version, findOneAndUpdate will be called with userId: 'user2' and should return null
    mockFindOneAndUpdate.mockResolvedValue(null);

    // In insecure version, findByIdAndUpdate is called and would return the chat
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user1', name: 'Updated Name' });

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name' })
    });

    const response = await PUT(
        request,
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(404);
  });

  it('should update chat name if user is owner', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const updatedChat = { _id: 'chat1', userId: 'user1', name: 'Updated Name' };
    mockFindOneAndUpdate.mockResolvedValue(updatedChat);
    mockFindByIdAndUpdate.mockResolvedValue(updatedChat);

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name' })
    });

    const response = await PUT(
        request,
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(200);
    expect((response as any).data).toEqual(updatedChat);

    // Verify that findOneAndUpdate was called with correct params
    // Note: mockFindOneAndUpdate is a vi.fn(), so we can check it.
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ _id: 'chat1', userId: 'user1' }),
        { name: 'Updated Name' }, // Fixed field name
        { new: true }
    );
  });
});
