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
    json: vi.fn((data, options) => ({ data, status: options?.status || 200 })),
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const req = new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // Insecure implementation uses findByIdAndUpdate
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user2', name: 'Old Name' });

    // Secure implementation uses findOneAndUpdate
    mockFindOneAndUpdate.mockResolvedValue(null);

    const req = new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(404);
  });

  it('should update chat name if user owns the chat', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const updatedChat = { _id: 'chat1', userId: 'user1', name: 'New Name' };

    mockFindOneAndUpdate.mockResolvedValue(updatedChat);
    mockFindByIdAndUpdate.mockResolvedValue(updatedChat);

    const req = new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(200);
    expect(response.data).toEqual(updatedChat);
  });
});
