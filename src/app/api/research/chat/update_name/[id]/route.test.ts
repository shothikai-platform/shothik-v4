
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
  const mockParams = Promise.resolve({ id: 'chat123' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);
    const req = new Request('http://localhost/api/research/chat/update_name/chat123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
    });

    const response = await PUT(req, { params: mockParams });

    // Currently vulnerable: likely fails with 500 or succeeds if mocks allow,
    // but definitely won't be 401 until we fix it.
    // If it's vulnerable, it will try to call db methods.
    // We expect the FIXED behavior to be 401.
    // But for reproduction, we can assert what we *expect* after fix.
    expect(response.status).toBe(401);
  });

  it('should prevent IDOR: fail if chat does not belong to user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    // Simulate chat not found for this user (because of IDOR check)
    mockFindOneAndUpdate.mockResolvedValue(null);
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat123', name: 'Old Name' }); // Simulate finding it if insecure

    const req = new Request('http://localhost/api/research/chat/update_name/chat123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
    });

    const response = await PUT(req, { params: mockParams });

    // After fix, it should use findOneAndUpdate with userId and return 404 if not found (owned)
    // If vulnerable, it uses findByIdAndUpdate and returns 200

    // We assert the secure behavior:
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ _id: 'chat123', userId: 'user123' }),
        expect.any(Object),
        expect.any(Object)
    );
    expect(response.status).toBe(404);
  });

  it('should update chat name if user owns it', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockFindOneAndUpdate.mockResolvedValue({ _id: 'chat123', name: 'New Name', userId: 'user123' });

    const req = new Request('http://localhost/api/research/chat/update_name/chat123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
    });

    const response = await PUT(req, { params: mockParams });

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ _id: 'chat123', userId: 'user123' }),
        { name: 'New Name' },
        { new: true }
    );
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ _id: 'chat123', name: 'New Name', userId: 'user123' });
  });
});
