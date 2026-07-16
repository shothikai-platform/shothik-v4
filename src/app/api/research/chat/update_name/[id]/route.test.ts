
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
      findByIdAndUpdate: vi.fn(),
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

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/123', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' })
        }),
        { params: Promise.resolve({ id: '123' }) }
    );

    expect(response.status).toBe(401);
  });

  it('should enforce IDOR protection by scoping update to userId', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    mockFindOneAndUpdate.mockResolvedValue({ _id: 'chat456', name: 'New Name' });

    await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat456', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' })
        }),
        { params: Promise.resolve({ id: 'chat456' }) }
    );

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'chat456', userId: 'user123' },
        { name: 'New Name' },
        { new: true }
    );
  });

  it('should enforce input length limit for name', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);

    const longName = 'a'.repeat(256);
    const response = await PUT(
        new Request('http://localhost/api/research/chat/update_name/chat456', {
            method: 'PUT',
            body: JSON.stringify({ name: longName })
        }),
        { params: Promise.resolve({ id: 'chat456' }) }
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('too long');
  });
});
