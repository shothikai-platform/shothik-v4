
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

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user (IDOR protection)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

    // If the code is secure, it should use findOneAndUpdate with userId
    mockFindOneAndUpdate.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(404);
    // Secure code should NOT use findByIdAndUpdate
    expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ _id: 'chat1', userId: 'user2' }),
        expect.any(Object),
        expect.any(Object)
    );
  });

  it('should update the "name" field, not "title"', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOneAndUpdate.mockResolvedValue({ _id: 'chat1', name: 'New Name' });

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ name: 'New Name' }),
        expect.any(Object)
    );

    // Check that it doesn't use 'title'
    const updateArg = mockFindOneAndUpdate.mock.calls[0][1];
    expect(updateArg.title).toBeUndefined();
  });

  it('should return 400 if name is too long', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'A'.repeat(101) }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(400);
  });
});
