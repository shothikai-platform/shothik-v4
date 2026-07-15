
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

    // In insecure version, it doesn't even call getAuthenticatedUser
    // So it will proceed to update.
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', name: 'Updated Name' });

    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'Updated Name' })
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // Current behavior: 200 (updates without auth)
    // Desired behavior: 401
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

    // In insecure version, it uses findByIdAndUpdate which doesn't check userId
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', name: 'Updated Name' });

    // In secure version, we expect findOneAndUpdate to be used with userId
    mockFindOneAndUpdate.mockResolvedValue(null);

    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'Updated Name' })
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // Current behavior: 200 (updates any chat)
    // Desired behavior: 404
    expect(response.status).toBe(404);
  });

  it('should update "name" field, not "title"', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'Correct Name' })
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // In insecure version, it calls findByIdAndUpdate(id, { title: name })
    // We want it to call findOneAndUpdate with { name: name }

    const updateCall = mockFindOneAndUpdate.mock.calls[0] || mockFindByIdAndUpdate.mock.calls[0];
    expect(updateCall).toBeDefined();
    const updateData = updateCall[1];
    expect(updateData).toHaveProperty('name');
    expect(updateData).not.toHaveProperty('title');
  });
});
