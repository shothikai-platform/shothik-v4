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
      findByIdAndUpdate: vi.fn(), // We expect this to NOT be used after fix
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

    const params = Promise.resolve({ id: 'chat123' });
    const request = new Request('http://localhost/api/research/chat/update_name/chat123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
    });
    const response = await PUT(request, { params });

    expect(response.status).toBe(401);
  });

  it('should update chat name if it belongs to user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockFindOneAndUpdate.mockResolvedValue({ _id: 'chat123', userId: 'user123', name: 'New Name' });

    const params = Promise.resolve({ id: 'chat123' });
    const request = new Request('http://localhost/api/research/chat/update_name/chat123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
    });
    const response = await PUT(request, { params });

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'chat123', userId: 'user123' },
        { name: 'New Name' },
        { new: true }
    );
    expect(response.status).toBe(200);
  });
});
