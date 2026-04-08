
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
    json: vi.fn((data, options) => ({ data, options, status: options?.status || 200, json: async () => data })),
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
      new Request('http://localhost/api/research/chat/update_name/123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
      }),
      { params: Promise.resolve({ id: '123' }) }
    );

    expect(response.status).toBe(401);
  });

  it('should verify ownership when updating chat name', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOneAndUpdate.mockResolvedValue({ _id: '123', name: 'New Name' });

    await PUT(
      new Request('http://localhost/api/research/chat/update_name/123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
      }),
      { params: Promise.resolve({ id: '123' }) }
    );

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: '123', userId: 'user123' },
      { name: 'New Name' },
      { new: true }
    );
  });

  it('should return 404 if chat not found or not owned by user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOneAndUpdate.mockResolvedValue(null);

    const response = await PUT(
      new Request('http://localhost/api/research/chat/update_name/123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
      }),
      { params: Promise.resolve({ id: '123' }) }
    );

    expect(response.status).toBe(404);
  });
});
