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

// Hoist mock functions
const { mockFindOneAndUpdate, mockFindByIdAndUpdate } = vi.hoisted(() => {
  return {
    mockFindOneAndUpdate: vi.fn(),
    mockFindByIdAndUpdate: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findOneAndUpdate: mockFindOneAndUpdate,
      findByIdAndUpdate: mockFindByIdAndUpdate,
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
    (getAuthenticatedUser as any).mockReset();
    mockFindOneAndUpdate.mockReset();
    mockFindByIdAndUpdate.mockReset();
  });

  it('should return 401 if user is not authenticated', async () => {
    // Current behavior: user is not checked, so this returns 200 if chat found
    // Desired behavior: 401
    (getAuthenticatedUser as any).mockResolvedValue(null);
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', name: 'New Name' });

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(
        request,
        { params: Promise.resolve({ id: 'chat1' }) } as any
    );

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user (IDOR prevention)', async () => {
    // Current behavior: findByIdAndUpdate finds the chat regardless of owner -> 200
    // Desired behavior: findOneAndUpdate({_id, userId}) returns null -> 404
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // Simulate chat existing but owned by someone else
    // If the code uses findByIdAndUpdate (vulnerable), it will return this chat.
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user2', name: 'New Name' });

    // If the code uses findOneAndUpdate (secure), we mock it to return null (not found for this user)
    mockFindOneAndUpdate.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(
        request,
        { params: Promise.resolve({ id: 'chat1' }) } as any
    );

    expect(response.status).toBe(404);
  });

  it('should update chat name successfully if user owns the chat', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const mockChat = { _id: 'chat1', userId: 'user1', name: 'New Name' };
    mockFindOneAndUpdate.mockResolvedValue(mockChat);

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(
        request,
        { params: Promise.resolve({ id: 'chat1' }) } as any
    );

    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockChat);

    // Verify we called the secure method with correct params
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ _id: 'chat1', userId: 'user1' }),
        expect.objectContaining({ name: 'New Name' }), // Fix functionality bug (title -> name)
        expect.any(Object)
    );
  });
});
