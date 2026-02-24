import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock Mongoose model
const { mockFindByIdAndUpdate, mockFindOneAndUpdate } = vi.hoisted(() => {
  return {
    mockFindByIdAndUpdate: vi.fn(),
    mockFindOneAndUpdate: vi.fn(),
  };
});

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    // In the insecure implementation, findByIdAndUpdate is called regardless of auth.
    // We mock it to return something so it doesn't crash, but we expect the route to return 401 BEFORE hitting DB.
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user1', name: 'Updated Name' });

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(
        request,
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // Current behavior: 200 (returns chat) because no auth check
    // Expected behavior once fixed: 401
    // But for reproduction, we assert what we WANT (401), and expect the test to FAIL.
    expect(response.status).toBe(401);
  });

  it('should return 404/403 if chat belongs to another user (IDOR)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2', id: 'user2' });

    // In insecure implementation: findByIdAndUpdate(id) finds the chat even if it belongs to user1.
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user1', name: 'Updated Name' });

    // In secure implementation: findOneAndUpdate({ _id: id, userId: user._id }) returns null.
    mockFindOneAndUpdate.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(
        request,
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // Current behavior: 200 (returns chat via findByIdAndUpdate)
    // Expected behavior once fixed: 404 (Not Found via findOneAndUpdate)
    expect(response.status).toBe(404);
  });
});
