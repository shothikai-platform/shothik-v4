
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
    json: vi.fn((data, options) => ({
        data,
        options,
        status: options?.status || 200,
        json: async () => data
    })),
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' })
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });
    mockFindOneAndUpdate.mockResolvedValue(null);

    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' })
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(404);
  });

  it('should update the chat name if authorized', async () => {
    const mockUser = { _id: 'user1' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOneAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user1', name: 'New Name' });

    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' })
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(200);
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'chat1', userId: mockUser._id },
        { name: 'New Name' },
        { new: true }
    );
  });
});
