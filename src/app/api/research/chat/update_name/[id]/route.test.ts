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

    const req = new Request('http://localhost/api/research/chat/update_name/chat123', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Title' }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat123' }) });

    expect(response.status).toBe(401);
  });

  it('should return 400 if name is not a string or empty', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    // Test with empty string
    const req1 = new Request('http://localhost/api/research/chat/update_name/chat123', {
      method: 'PUT',
      body: JSON.stringify({ name: '   ' }),
    });
    const response1 = await PUT(req1, { params: Promise.resolve({ id: 'chat123' }) });
    expect(response1.status).toBe(400);

    // Test with non-string
    const req2 = new Request('http://localhost/api/research/chat/update_name/chat123', {
      method: 'PUT',
      body: JSON.stringify({ name: 123 }),
    });
    const response2 = await PUT(req2, { params: Promise.resolve({ id: 'chat123' }) });
    expect(response2.status).toBe(400);
  });

  it('should return 400 if name exceeds 100 characters', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    const longName = 'a'.repeat(101);
    const req = new Request('http://localhost/api/research/chat/update_name/chat123', {
      method: 'PUT',
      body: JSON.stringify({ name: longName }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat123' }) });

    expect(response.status).toBe(400);
  });

  it('should return 404 if chat is not found or belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    mockFindOneAndUpdate.mockResolvedValue(null);

    const req = new Request('http://localhost/api/research/chat/update_name/chat123', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Valid Name' }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat123' }) });

    expect(response.status).toBe(404);
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat123', userId: 'user123' },
      { name: 'Valid Name' },
      { new: true }
    );
  });

  it('should return 200 and updated chat on success', async () => {
    const mockChat = { _id: 'chat123', userId: 'user123', name: 'Valid Name' };
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    mockFindOneAndUpdate.mockResolvedValue(mockChat);

    const req = new Request('http://localhost/api/research/chat/update_name/chat123', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Valid Name' }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat123' }) });

    expect(response.status).toBe(200);
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat123', userId: 'user123' },
      { name: 'Valid Name' },
      { new: true }
    );
  });
});
