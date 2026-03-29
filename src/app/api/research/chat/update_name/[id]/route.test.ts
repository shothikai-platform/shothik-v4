import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';

// 1. Hoist the mocks before vi.mock
const mockFindOneAndUpdate = vi.hoisted(() => vi.fn());

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findOneAndUpdate: mockFindOneAndUpdate,
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

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });
    const params = Promise.resolve({ id: 'chat123' });

    const response = await PUT(request, { params });
    expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
  });

  it('updates chat name successfully if user owns it', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    const mockChat = { _id: 'chat123', name: 'New Name', userId: 'user1' };
    mockFindOneAndUpdate.mockResolvedValue(mockChat);

    const request = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });
    const params = Promise.resolve({ id: 'chat123' });

    const response = await PUT(request, { params });
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat123', userId: 'user1' },
      { title: 'New Name' },
      { new: true }
    );
    expect(mockJson).toHaveBeenCalledWith(mockChat);
  });

  it('returns 404 if chat not found or user does not own it (IDOR protection)', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user2' });
    // Simulate query returning null because the userId doesn't match
    mockFindOneAndUpdate.mockResolvedValue(null);

    const request = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Hacked Name' }),
    });
    const params = Promise.resolve({ id: 'chat123' });

    const response = await PUT(request, { params });
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat123', userId: 'user2' },
      { title: 'Hacked Name' },
      { new: true }
    );
    expect(mockJson).toHaveBeenCalledWith({ error: 'Chat not found' }, { status: 404 });
  });

  it('handles errors gracefully', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOneAndUpdate.mockRejectedValue(new Error('DB Error'));

    const request = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });
    const params = Promise.resolve({ id: 'chat123' });

    const response = await PUT(request, { params });
    expect(mockJson).toHaveBeenCalledWith({ error: 'Failed' }, { status: 500 });
  });
});
