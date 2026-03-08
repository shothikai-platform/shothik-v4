import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';
import dbConnect from '@/lib/dbConnect';

// Mock dependencies
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findOneAndDelete: vi.fn(),
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

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost');
    const params = Promise.resolve({ id: 'chat123' });

    const response = await DELETE(request, { params });

    expect(response.status).toBe(401);
    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
  });

  it('should return 404 if chat is not found or does not belong to user', async () => {
    const mockUser = { _id: 'user123' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (ResearchChat.findOneAndDelete as any).mockResolvedValue(null);

    const request = new Request('http://localhost');
    const params = Promise.resolve({ id: 'chat123' });

    const response = await DELETE(request, { params });

    expect(dbConnect).toHaveBeenCalled();
    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
      _id: 'chat123',
      userId: 'user123',
    });
    expect(response.status).toBe(404);
    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Chat not found' }, { status: 404 });
  });

  it('should return success true if chat is deleted successfully', async () => {
    const mockUser = { _id: 'user123' };
    const mockChat = { _id: 'chat123', title: 'Test Chat' };
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (ResearchChat.findOneAndDelete as any).mockResolvedValue(mockChat);

    const request = new Request('http://localhost');
    const params = Promise.resolve({ id: 'chat123' });

    const response = await DELETE(request, { params });

    expect(dbConnect).toHaveBeenCalled();
    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
      _id: 'chat123',
      userId: 'user123',
    });
    expect(response.status).toBe(200);
    expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
  });
});
