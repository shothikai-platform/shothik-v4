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

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated Name' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(401);
  });

  it('should return 400 if name is missing or empty', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: '' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(400);
  });

  it('should return 400 if name is not a string', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 12345 }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(400);
  });

  it('should return 400 if name exceeds 100 characters', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    const longName = 'a'.repeat(101);
    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: longName }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(400);
  });

  it('should return 404 if chat is not found or does not belong to user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    mockFindOneAndUpdate.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(404);
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat1', userId: 'user123' },
      { name: 'New Name' },
      { new: true }
    );
  });

  it('should successfully update name and return updated chat', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    const mockUpdatedChat = { _id: 'chat1', userId: 'user123', name: 'New Name' };
    mockFindOneAndUpdate.mockResolvedValue(mockUpdatedChat);

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(200);
    expect((response as any).data).toEqual(mockUpdatedChat);
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat1', userId: 'user123' },
      { name: 'New Name' },
      { new: true }
    );
  });
});
