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

    const req = new Request('http://localhost/api/research/chat/update_name/chat123', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Valid New Name' })
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat123' }) });

    expect(response.status).toBe(401);
    expect((response as any).data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if name is empty or not a string', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    // Empty string
    let req = new Request('http://localhost/api/research/chat/update_name/chat123', {
      method: 'PUT',
      body: JSON.stringify({ name: '   ' })
    });
    let response = await PUT(req, { params: Promise.resolve({ id: 'chat123' }) });
    expect(response.status).toBe(400);
    expect((response as any).data).toEqual({ error: 'Invalid name' });

    // Non-string
    req = new Request('http://localhost/api/research/chat/update_name/chat123', {
      method: 'PUT',
      body: JSON.stringify({ name: 12345 })
    });
    response = await PUT(req, { params: Promise.resolve({ id: 'chat123' }) });
    expect(response.status).toBe(400);
    expect((response as any).data).toEqual({ error: 'Invalid name' });
  });

  it('should return 404 if chat is not found or belongs to another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    mockFindOneAndUpdate.mockResolvedValue(null);

    const req = new Request('http://localhost/api/research/chat/update_name/chat123', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Valid Name' })
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat123' }) });

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat123', userId: 'user123' },
      { name: 'Valid Name' },
      { new: true }
    );
    expect(response.status).toBe(404);
    expect((response as any).data).toEqual({ error: 'Chat not found' });
  });

  it('should update name, truncate if over 100 characters, and return 200 on success', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ id: 'user123' }); // testing fallback of user.id
    const updatedChat = { _id: 'chat123', userId: 'user123', name: 'A'.repeat(100) };
    mockFindOneAndUpdate.mockResolvedValue(updatedChat);

    const longName = 'A'.repeat(120);
    const req = new Request('http://localhost/api/research/chat/update_name/chat123', {
      method: 'PUT',
      body: JSON.stringify({ name: longName })
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat123' }) });

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat123', userId: 'user123' },
      { name: 'A'.repeat(100) },
      { new: true }
    );
    expect(response.status).toBe(200);
    expect((response as any).data).toEqual(updatedChat);
  });
});
