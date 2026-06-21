
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
    json: vi.fn((data, options) => ({
        data,
        options,
        status: options?.status || 200,
        json: async () => data
    })),
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
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user1', name: 'Updated Name' });

    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'Updated Name' })
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // This is expected to FAIL initially because the route doesn't check auth
    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user (IDOR check)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

    // findOneAndUpdate would return null if scoped to user2 and the chat belongs to user1
    mockFindOneAndUpdate.mockResolvedValue(null);
    // current implementation uses findByIdAndUpdate
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user1', name: 'Updated Name' });

    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'Updated Name' })
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // This is expected to FAIL initially because the route doesn't check ownership
    expect(response.status).toBe(404);
  });

  it('should update the name field, not title', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOneAndUpdate.mockImplementation((filter, update) => {
        if (update.name) return Promise.resolve({ ...filter, name: update.name });
        return Promise.resolve(null);
    });

    // Current implementation uses findByIdAndUpdate with { title: name }
    mockFindByIdAndUpdate.mockImplementation((id, update) => {
        return Promise.resolve({ _id: id, ...update });
    });

    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'Correct Name' })
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    // Verify what was passed to the mock
    // Initially this will show that it was called with { title: 'Correct Name' }
    if (mockFindByIdAndUpdate.mock.calls.length > 0) {
        expect(mockFindByIdAndUpdate.mock.calls[0][1]).toHaveProperty('name');
        expect(mockFindByIdAndUpdate.mock.calls[0][1]).not.toHaveProperty('title');
    } else {
        expect(mockFindOneAndUpdate.mock.calls[0][1]).toHaveProperty('name');
        expect(mockFindOneAndUpdate.mock.calls[0][1]).not.toHaveProperty('title');
    }
  });
});
