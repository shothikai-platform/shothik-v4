
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

// Mock Mongoose model
const { mockFindOneAndUpdate } = vi.hoisted(() => {
  return {
    mockFindOneAndUpdate: vi.fn(),
  };
});

vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findOneAndUpdate: mockFindOneAndUpdate,
      findByIdAndUpdate: vi.fn(), // Existing insecure method
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
import ResearchChat from '@/models/ResearchChat';

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/update_name/chat123', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    // params is a Promise in Next.js 15+ (as seen in the source code)
    const params = Promise.resolve({ id: 'chat123' });

    const response = await PUT(request, { params });

    expect(response.status).toBe(401);
  });

  it('should update chat name if user owns the chat', async () => {
    const mockUser = { _id: 'user123', id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockFindOneAndUpdate.mockResolvedValue({ _id: 'chat123', name: 'New Name' });

    const request = new Request('http://localhost/api/research/chat/update_name/chat123', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });
    const params = Promise.resolve({ id: 'chat123' });

    const response = await PUT(request, { params });

    expect(response.status).toBe(200);
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat123', userId: 'user123' },
      { name: 'New Name' },
      { new: true }
    );
  });

  it('should return 404 if chat does not exist or user does not own it', async () => {
    const mockUser = { _id: 'user123', id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    mockFindOneAndUpdate.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/update_name/chat123', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });
    const params = Promise.resolve({ id: 'chat123' });

    const response = await PUT(request, { params });

    expect(response.status).toBe(404);
  });
});
