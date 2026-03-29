import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';

// 1. Hoist the mocks before vi.mock
const mockFindOneAndDelete = vi.hoisted(() => vi.fn());

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findOneAndDelete: mockFindOneAndDelete,
  },
}));

// Mock NextResponse
const mockJson = vi.hoisted(() => vi.fn().mockImplementation((data, options) => {
  return {
    ...data,
    ...options,
    json: async () => data,
  };
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: mockJson,
  },
}));

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost');
    const params = Promise.resolve({ id: 'chat123' });

    const response = await DELETE(request, { params });
    expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
  });

  it('deletes chat successfully if user owns it', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOneAndDelete.mockResolvedValue({ _id: 'chat123', userId: 'user1' });

    const request = new Request('http://localhost');
    const params = Promise.resolve({ id: 'chat123' });

    const response = await DELETE(request, { params });
    expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user1' });
    expect(mockJson).toHaveBeenCalledWith({ success: true });
  });

  it('returns 404 if chat not found or user does not own it (IDOR protection)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });
    // Simulate query returning null because the userId doesn't match
    mockFindOneAndDelete.mockResolvedValue(null);

    const request = new Request('http://localhost');
    const params = Promise.resolve({ id: 'chat123' });

    const response = await DELETE(request, { params });
    expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: 'chat123', userId: 'user2' });
    expect(mockJson).toHaveBeenCalledWith({ error: 'Chat not found' }, { status: 404 });
  });

  it('handles errors gracefully', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOneAndDelete.mockRejectedValue(new Error('DB Error'));

    const request = new Request('http://localhost');
    const params = Promise.resolve({ id: 'chat123' });

    const response = await DELETE(request, { params });
    expect(mockJson).toHaveBeenCalledWith({ error: 'Failed' }, { status: 500 });
  });
});
