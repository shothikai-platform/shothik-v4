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
            body: JSON.stringify({ name: 'New Name' }),
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(401);
  });

  it('should return 400 if name is invalid or too long', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // Invalid: empty name
    let response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: '   ' }),
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );
    expect(response.status).toBe(400);

    // Invalid: name is not a string
    response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 123 }),
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );
    expect(response.status).toBe(400);

    // Invalid: name is too long
    response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'a'.repeat(101) }),
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );
    expect(response.status).toBe(400);
  });

  it('should successfully update name and scope query to user (prevent IDOR)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOneAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user1', name: 'New Name' });

    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' }),
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'chat1', userId: 'user1' },
        { name: 'New Name' },
        { new: true }
    );
    expect(response.status).toBe(200);
    expect((response as any).data).toEqual({ _id: 'chat1', userId: 'user1', name: 'New Name' });
  });

  it('should return 404 if chat is not found or does not belong to user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });
    mockFindOneAndUpdate.mockResolvedValue(null);

    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat1', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' }),
        }),
        { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(404);
  });
});
