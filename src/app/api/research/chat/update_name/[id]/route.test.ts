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

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/update_name/123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
    });

    const response = await PUT(request, { params: Promise.resolve({ id: '123' }) });

    expect(response.status).toBe(401);
  });

  it('should verify authorization using findOneAndUpdate', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const mockChat = { _id: '123', name: 'New Name' };
    mockFindOneAndUpdate.mockResolvedValue(mockChat);

    const request = new Request('http://localhost/api/research/chat/update_name/123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
    });

    await PUT(request, { params: Promise.resolve({ id: '123' }) });

    // Ensure it queries by both ID and User ID
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: '123', userId: 'user123' },
        { name: 'New Name' },
        { new: true }
    );
  });
});
