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

    const req = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Chat Name' }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(401);
    expect((response as any).data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if name is missing, not a string, or empty', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const testPayloads = [
      {},
      { name: 123 },
      { name: '' },
      { name: '   ' },
    ];

    for (const payload of testPayloads) {
      const req = new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const response = await PUT(req, { params: Promise.resolve({ id: 'chat1' }) });

      expect(response.status).toBe(400);
      expect((response as any).data).toEqual({ error: 'Invalid name' });
    }
  });

  it('should return 400 if name exceeds 100 characters', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const longName = 'a'.repeat(101);
    const req = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: longName }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(400);
    expect((response as any).data).toEqual({ error: 'Invalid name' });
  });

  it('should return 404 if chat belongs to another user or does not exist', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOneAndUpdate.mockResolvedValue(null);

    const req = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat1' }) });

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat1', userId: 'user1' },
      { name: 'New Name' },
      { new: true }
    );
    expect(response.status).toBe(404);
    expect((response as any).data).toEqual({ error: 'Chat not found' });
  });

  it('should successfully update chat name if authorized and valid', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOneAndUpdate.mockResolvedValue({
      _id: 'chat1',
      userId: 'user1',
      name: 'New Name',
    });

    const req = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat1' }) });

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat1', userId: 'user1' },
      { name: 'New Name' },
      { new: true }
    );
    expect(response.status).toBe(200);
    expect((response as any).data).toEqual({
      _id: 'chat1',
      userId: 'user1',
      name: 'New Name',
    });
  });
});
