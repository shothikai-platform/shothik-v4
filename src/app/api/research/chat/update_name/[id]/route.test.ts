import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const { mockFindOneAndUpdate } = vi.hoisted(() => ({
  mockFindOneAndUpdate: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findOneAndUpdate: mockFindOneAndUpdate,
  },
}));

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
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat1' }) });
    expect(response.status).toBe(401);
  });

  it('should return 400 for invalid or empty name', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const req = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: '   ' }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat1' }) });
    expect(response.status).toBe(400);
  });

  it('should return 400 for name exceeding length limit', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const req = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'a'.repeat(101) }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat1' }) });
    expect(response.status).toBe(400);
  });

  it('should return 404 if chat is not found or owned by another user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    mockFindOneAndUpdate.mockResolvedValue(null);

    const req = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Valid Name' }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat1' }) });
    expect(response.status).toBe(404);
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat1', userId: 'user1' },
      { name: 'Valid Name' },
      { new: true }
    );
  });

  it('should return updated chat on success', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    const mockChat = { _id: 'chat1', userId: 'user1', name: 'Valid Name' };
    mockFindOneAndUpdate.mockResolvedValue(mockChat);

    const req = new Request('http://localhost/api/research/chat/update_name/chat1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Valid Name' }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: 'chat1' }) });
    expect(response.status).toBe(200);
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat1', userId: 'user1' },
      { name: 'Valid Name' },
      { new: true }
    );
  });
});
