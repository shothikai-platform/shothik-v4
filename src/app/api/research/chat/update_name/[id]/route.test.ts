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

describe('PUT /api/research/chat/update_name/[id]', () => {
  const mockUserId = 'user123';
  const mockChatId = 'chat456';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should prevent unauthorized access if user is not logged in', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request(`http://localhost/api/research/chat/update_name/${mockChatId}`, {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    // In the vulnerable code, this might throw or proceed without checking user.
    // If it proceeds, it returns 200 (if mocking findByIdAndUpdate succeeds) or 500 (if mocking fails).
    // The fixed code should return 401.
    const response = await PUT(request, { params: Promise.resolve({ id: mockChatId }) });

    // Expect 401 Unauthorized
    expect(response.status).toBe(401);
  });

  it('should update chat name if user is owner', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });

    // Mock successful update
    mockFindOneAndUpdate.mockResolvedValue({ _id: mockChatId, name: 'New Name', userId: mockUserId });

    // For vulnerable code (findByIdAndUpdate), mock it too just in case
    mockFindByIdAndUpdate.mockResolvedValue({ _id: mockChatId, name: 'New Name', userId: mockUserId });

    const request = new Request(`http://localhost/api/research/chat/update_name/${mockChatId}`, {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: mockChatId }) });

    expect(response.status).toBe(200);

    // The fixed code should use findOneAndUpdate with userId
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ _id: mockChatId, userId: mockUserId }),
      expect.objectContaining({ name: 'New Name' }),
      expect.anything()
    );
  });

  it('should return 404 if chat does not belong to user (IDOR check)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });

    // Mock finding nothing for this user+chat combo
    mockFindOneAndUpdate.mockResolvedValue(null);

    // However, findByIdAndUpdate (vulnerable) would find it regardless of user
    mockFindByIdAndUpdate.mockResolvedValue({ _id: mockChatId, name: 'Old Name', userId: 'otherUser' });

    const request = new Request(`http://localhost/api/research/chat/update_name/${mockChatId}`, {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: mockChatId }) });

    // IDOR test: if it returns 200, it means it found the chat even though it belongs to 'otherUser' (in the vulnerable implementation)
    // We expect 404 in the secured implementation
    expect(response.status).toBe(404);

    // Ensure we tried to find with userId
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ userId: mockUserId }),
        expect.anything(),
        expect.anything()
    );
  });
});
