import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findByIdAndUpdate: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
  },
}));

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/update_name/123', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    const params = Promise.resolve({ id: '123' });
    const response = await PUT(request, { params });

    expect(response.status).toBe(401);
    expect(response.data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 404 if chat is not found or does not belong to user', async () => {
    const mockUser = { _id: 'user123', id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/update_name/chat123', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    const params = Promise.resolve({ id: 'chat123' });
    const response = await PUT(request, { params });

    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat123', userId: 'user123' },
      { name: 'New Name' },
      { new: true }
    );
    expect(response.status).toBe(404);
    expect(response.data).toEqual({ error: 'Chat not found' });
  });

  it('should update chat name successfully if user owns the chat', async () => {
    const mockUser = { _id: 'user123', id: 'user123' };
    const mockChat = { _id: 'chat123', userId: 'user123', name: 'New Name' };

    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(mockChat);

    const request = new Request('http://localhost/api/research/chat/update_name/chat123', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });

    const params = Promise.resolve({ id: 'chat123' });
    const response = await PUT(request, { params });

    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat123', userId: 'user123' },
      { name: 'New Name' },
      { new: true }
    );
    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockChat);
  });
});
