
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';

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
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2', id: 'user2' });

    // In the secure version, findOneAndUpdate will return null because the userId won't match.
    mockFindOneAndUpdate.mockResolvedValue(null);

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

  it('should update chat name if user is authorized', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1', id: 'user1' });

    const updatedChat = { _id: 'chat1', userId: 'user1', name: 'New Name' };
    mockFindOneAndUpdate.mockResolvedValue(updatedChat);

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
    });

    const response = await PUT(
        request,
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.name).toBe('New Name');
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'chat1', userId: 'user1' },
        { name: 'New Name' },
        { new: true }
    );
  });
});
