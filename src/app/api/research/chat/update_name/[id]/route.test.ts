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
        body: JSON.stringify({ name: 'Updated Chat Name' }),
      }),
      { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(response.status).toBe(401);
    expect((response as any).data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if name parameter is missing or invalid', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // Missing name
    let response = await PUT(
      new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: 'chat1' }) }
    );
    expect(response.status).toBe(400);

    // Empty name
    response = await PUT(
      new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: '   ' }),
      }),
      { params: Promise.resolve({ id: 'chat1' }) }
    );
    expect(response.status).toBe(400);

    // Name too long (> 100 chars)
    const longName = 'a'.repeat(101);
    response = await PUT(
      new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: longName }),
      }),
      { params: Promise.resolve({ id: 'chat1' }) }
    );
    expect(response.status).toBe(400);
    expect((response as any).data).toEqual({ error: 'Invalid name parameter' });
  });

  it('should return 404 if chat belongs to another user (IDOR prevention) or not found', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOneAndUpdate.mockResolvedValue(null);

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
    expect(response.status).toBe(404);
    expect((response as any).data).toEqual({ error: 'Chat not found' });
  });

  it('should successfully update and return the chat name', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    const mockChat = { _id: 'chat1', userId: 'user1', name: 'New Name' };
    mockFindOneAndUpdate.mockResolvedValue(mockChat);

    const response = await PUT(
      new Request('http://localhost/api/research/chat/update_name/chat1', {
        method: 'PUT',
        body: JSON.stringify({ name: ' New Name  ' }), // verify whitespace is trimmed
      }),
      { params: Promise.resolve({ id: 'chat1' }) }
    );

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat1', userId: 'user1' },
      { name: 'New Name' },
      { new: true }
    );
    expect(response.status).toBe(200);
    expect((response as any).data).toEqual(mockChat);
  });
});
