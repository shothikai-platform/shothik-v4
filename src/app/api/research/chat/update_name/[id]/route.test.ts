
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
import ResearchChat from '@/models/ResearchChat';

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

  it('should return 404 if chat belongs to another user or does not exist', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOneAndUpdate.mockResolvedValue(null);

    const response = await PUT(
      new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name' }),
      }),
      { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(404);
    // Verify that it tried to find by BOTH id and userId
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'chat1', userId: 'user1' }),
      expect.anything(),
      expect.anything()
    );
  });

  it('should update the "name" field, not "title"', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOneAndUpdate.mockResolvedValue({ _id: 'chat1', name: 'Updated Name' });

    await PUT(
      new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name' }),
      }),
      { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ name: 'Updated Name' }),
      expect.anything()
    );
    expect(mockFindOneAndUpdate).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ title: 'Updated Name' }),
      expect.anything()
    );
  });
});
