
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

    const response = await PUT(
      new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name' }),
      }),
      { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user (IDOR prevention)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });
    // Simulate that the chat is not found for this user
    mockFindOneAndUpdate.mockResolvedValue(null);

    const response = await PUT(
      new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name' }),
      }),
      { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(404);
  });

  it('should update chat name if user owns the chat', async () => {
    const mockUser = { _id: 'user1' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOneAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user1', name: 'Updated Name' });

    const response = await PUT(
      new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name' }),
      }),
      { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(200);
    // After fixing, we expect it to be called with userId
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ _id: 'chat1', userId: 'user1' }),
        expect.objectContaining({ name: 'Updated Name' }),
        expect.anything()
    );
  });
});
