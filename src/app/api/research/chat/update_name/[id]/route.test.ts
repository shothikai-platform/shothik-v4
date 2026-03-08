import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';
import dbConnect from '@/lib/dbConnect';

// Mock dependencies
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => {
  const mockJson = vi.fn((data, options) => ({
    status: options?.status || 200,
    json: async () => data,
  }));
  return {
    NextResponse: {
      json: mockJson,
    },
  };
});

import { NextResponse } from 'next/server';

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });
    const params = Promise.resolve({ id: 'chat123' });

    const response = await PUT(request, { params });

    expect(response.status).toBe(401);
    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
  });

  it('should return 404 if chat is not found or does not belong to user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(null);

    const request = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });
    const params = Promise.resolve({ id: 'chat123' });

    const response = await PUT(request, { params });

    expect(dbConnect).toHaveBeenCalled();
    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat123', userId: 'user123' },
      { title: 'New Name' },
      { new: true }
    );
    expect(response.status).toBe(404);
    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Chat not found' }, { status: 404 });
  });

  it('should return updated chat if successful', async () => {
    const mockUser = { _id: 'user123' };
    const mockChat = { _id: 'chat123', title: 'New Name' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(mockChat);

    const request = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });
    const params = Promise.resolve({ id: 'chat123' });

    const response = await PUT(request, { params });

    expect(dbConnect).toHaveBeenCalled();
    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'chat123', userId: 'user123' },
      { title: 'New Name' },
      { new: true }
    );
    expect(response.status).toBe(200);
    expect(NextResponse.json).toHaveBeenCalledWith(mockChat);
  });
});
