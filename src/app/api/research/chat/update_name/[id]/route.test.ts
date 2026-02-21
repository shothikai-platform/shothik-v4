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

    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' })
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(401);
    expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
    expect(mockFindByIdAndUpdate).not.toHaveBeenCalled(); // Should stop before DB call
  });

  it('should return 404 if chat belongs to another user (IDOR prevention)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' }); // Current user is user2

    // Secure code should use findOneAndUpdate with userId filter.
    // We simulate that NO chat is found with {_id: chat1, userId: user2}
    mockFindOneAndUpdate.mockResolvedValue(null);

    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' })
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(404);

    // Verify findOneAndUpdate was called with correct filter
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ _id: 'chat1', userId: 'user2' }),
        expect.anything(),
        expect.anything()
    );
  });

  it('should update chat name if user owns it', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const updatedChat = { _id: 'chat1', userId: 'user1', name: 'Updated Name' };

    // We mock findOneAndUpdate to return the updated chat
    mockFindOneAndUpdate.mockResolvedValue(updatedChat);

    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'Updated Name' })
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(200);
    expect(response.data).toEqual(updatedChat);

    // Verify findOneAndUpdate was called with correct filter and update
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ _id: 'chat1', userId: 'user1' }),
        { name: 'Updated Name' },
        { new: true }
    );
  });
});
