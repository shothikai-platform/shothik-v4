
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

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat belongs to another user (IDOR check)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });

    // The current (vulnerable) code uses findByIdAndUpdate, so we need to mock it to simulate finding the chat (owned by user1).
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user1', name: 'New Name' });

    // I should also mock findOneAndUpdate to return null (secure behavior - user2 doesn't own chat1).
    mockFindOneAndUpdate.mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    expect(response.status).toBe(404);
  });

  it('should update with the correct field name', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // Mock success for secure update
    mockFindOneAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user1', name: 'New Name' });

    // Mock success for insecure update
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'chat1', userId: 'user1', name: 'New Name' });

    const request = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    await PUT(request, { params: Promise.resolve({ id: 'chat1' }) });

    // The current code calls findByIdAndUpdate(id, { title: 'New Name' })
    // The secure code should call findOneAndUpdate({ _id: id, userId: user._id }, { name: 'New Name' })

    // We check if findOneAndUpdate was called with correct args
    // Since current code doesn't call it, this will fail.
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ _id: 'chat1', userId: 'user1' }),
        expect.objectContaining({ name: 'New Name' }),
        expect.anything()
    );
  });
});
