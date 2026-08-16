import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';

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

    const req = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Title' }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat1' }) });
    expect(response.status).toBe(401);
  });

  it('should return 400 if name is missing or invalid', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // Missing name
    const req1 = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({}),
    });
    const res1 = await PUT(req1, { params: Promise.resolve({ id: 'chat1' }) });
    expect(res1.status).toBe(400);

    // Name too long (>100 chars)
    const req2 = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'a'.repeat(101) }),
    });
    const res2 = await PUT(req2, { params: Promise.resolve({ id: 'chat1' }) });
    expect(res2.status).toBe(400);
  });

  it('should return 404 if chat is not found or belongs to another user (IDOR protection)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOneAndUpdate.mockResolvedValue(null);

    const req = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated Title' }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat1' }) });
    expect(response.status).toBe(404);
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat1', userId: 'user1' },
      { name: 'Updated Title' },
      { new: true }
    );
  });

  it('should successfully update chat name for the owner', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    const updatedChat = { _id: 'chat1', userId: 'user1', name: 'Updated Title' };
    mockFindOneAndUpdate.mockResolvedValue(updatedChat);

    const req = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated Title' }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat1' }) });
    expect(response.status).toBe(200);
    expect(response.data).toEqual(updatedChat);
  });
});
