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

    const response = await PUT(
      new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name' }),
      }),
      { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(401);
  });

  it('should return 400 if name is missing or invalid', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const response = await PUT(
      new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: '' }),
      }),
      { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(400);
  });

  it('should return 400 if name exceeds 100 characters', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const longName = 'a'.repeat(101);
    const response = await PUT(
      new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: longName }),
      }),
      { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(400);
  });

  it('should return 404 if chat belongs to another user or is not found', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });
    mockFindOneAndUpdate.mockResolvedValue(null);

    const response = await PUT(
      new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
      }),
      { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat1', userId: 'user2' },
      { name: 'New Name' },
      { new: true }
    );
    expect(response.status).toBe(404);
  });

  it('should successfully update name when authorized and input valid', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    const mockUpdatedChat = { _id: 'chat1', userId: 'user1', name: 'Updated Name' };
    mockFindOneAndUpdate.mockResolvedValue(mockUpdatedChat);

    const response = await PUT(
      new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name' }),
      }),
      { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat1', userId: 'user1' },
      { name: 'Updated Name' },
      { new: true }
    );
    expect(response.status).toBe(200);
    expect((response as any).data).toEqual(mockUpdatedChat);
  });
});
