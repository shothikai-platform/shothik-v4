import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindOneAndUpdate } = vi.hoisted(() => {
  return {
    mockFindOneAndUpdate: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
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

  it('should return 400 if name is missing or too long', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // Missing name
    let response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: '' })
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );
    expect(response.status).toBe(400);

    // Too long name
    response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'a'.repeat(101) })
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );
    expect(response.status).toBe(400);
  });

  it('should return 404 if chat belongs to another user or does not exist', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOneAndUpdate.mockResolvedValue(null);

    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' })
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(404);
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'chat1', userId: 'user1' },
        { name: 'New Name' },
        { new: true }
    );
  });

  it('should return 200 and updated chat if successful', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    const updatedChat = { _id: 'chat1', userId: 'user1', name: 'New Name' };
    mockFindOneAndUpdate.mockResolvedValue(updatedChat);

    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' })
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(updatedChat);
  });
});
