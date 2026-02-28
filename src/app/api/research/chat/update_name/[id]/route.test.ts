import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

const { mockGetAuthenticatedUser } = vi.hoisted(() => {
  return {
    mockGetAuthenticatedUser: vi.fn(),
  };
});

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: mockGetAuthenticatedUser,
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

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(401);
    expect(response.data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 404 if chat belongs to another user or does not exist', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ _id: 'user2' });

    mockFindOneAndUpdate.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'chat1', userId: 'user2' },
        { title: 'New Name' },
        { new: true }
    );
    expect(response.status).toBe(404);
    expect(response.data).toEqual({ error: 'Chat not found' });
  });

  it('should update and return the chat if user is authenticated and owns the chat', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ _id: 'user1' });

    const updatedChat = { _id: 'chat1', userId: 'user1', title: 'New Name' };
    mockFindOneAndUpdate.mockResolvedValue(updatedChat);

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'chat1', userId: 'user1' },
        { title: 'New Name' },
        { new: true }
    );
    expect(response.status).toBe(200);
    expect(response.data).toEqual(updatedChat);
  });
});
