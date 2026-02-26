
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

// Hoisted mocks for Mongoose methods
const mocks = vi.hoisted(() => {
  return {
    mockFindOneAndUpdate: vi.fn(),
    mockFindByIdAndUpdate: vi.fn(),
  };
});

// Mock Mongoose model
vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findOneAndUpdate: mocks.mockFindOneAndUpdate,
      findByIdAndUpdate: mocks.mockFindByIdAndUpdate,
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

    // Mock finding chat even if unauthenticated (to prove vulnerability)
    mocks.mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', name: 'Old Name' });

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(
        request,
        // @ts-ignore
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // Secure behavior: 401
    // Insecure behavior: 200 (because findByIdAndUpdate succeeds)
    expect(response.status).toBe(401);
  });

  it('should return 404/403 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1', id: 'user1' });

    // Scenario: Chat exists but belongs to 'user2'
    // Insecure code: findByIdAndUpdate finds it -> returns 200
    mocks.mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user2', name: 'New Name' });

    // Secure code: findOneAndUpdate({_id:..., userId: 'user1'}) -> returns null
    mocks.mockFindOneAndUpdate.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(
        request,
        // @ts-ignore
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // Secure behavior: 404 Not Found (or 403)
    expect(response.status).toBe(404);
  });

  it('should update name correctly if authenticated and authorized', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1', id: 'user1' });

    const mockChat = { _id: 'chat1', userId: 'user1', name: 'New Name' };
    mocks.mockFindOneAndUpdate.mockResolvedValue(mockChat);

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(
        request,
        // @ts-ignore
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(200);
    // @ts-ignore
    expect(response.data).toEqual(mockChat);

    // Verify findOneAndUpdate was called with correct arguments
    // This ensures we switched to the secure method
    expect(mocks.mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ _id: 'chat1', userId: 'user1' }), // Query
        expect.objectContaining({ name: 'New Name' }), // Update
        expect.objectContaining({ new: true }) // Options
    );
  });
});
