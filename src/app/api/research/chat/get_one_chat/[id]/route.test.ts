import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, options })),
  },
}));

import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

describe('GET /api/research/chat/get_one_chat/[id]', () => {
  const mockParams = Promise.resolve({ id: 'chat-123' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/get_one_chat/chat-123');
    const response = await GET(request, { params: mockParams });

    expect(response.options.status).toBe(401);
    expect(response.data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 404 if chat is not found', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ id: 'user-123', _id: 'user-123' });
    (ResearchChat.findOne as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/get_one_chat/chat-123');
    const response = await GET(request, { params: mockParams });

    expect(ResearchChat.findOne).toHaveBeenCalledWith({ _id: 'chat-123', userId: 'user-123' });
    expect(response.options.status).toBe(404);
  });

  it('should return chat if found and owned by user', async () => {
    const mockChat = { _id: 'chat-123', userId: 'user-123', name: 'Test Chat' };
    (getAuthenticatedUser as any).mockResolvedValue({ id: 'user-123', _id: 'user-123' });
    (ResearchChat.findOne as any).mockResolvedValue(mockChat);

    const request = new Request('http://localhost/api/research/chat/get_one_chat/chat-123');
    const response = await GET(request, { params: mockParams });

    expect(ResearchChat.findOne).toHaveBeenCalledWith({ _id: 'chat-123', userId: 'user-123' });
    expect(response.data).toEqual(mockChat);
  });

  it('should return 404 if chat exists but belongs to another user (because findOne filters by userId)', async () => {
    // In our implementation, findOne returns null if userId doesn't match, so it's a 404.
    (getAuthenticatedUser as any).mockResolvedValue({ id: 'user-123', _id: 'user-123' });
    (ResearchChat.findOne as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/get_one_chat/chat-123');
    const response = await GET(request, { params: mockParams });

    expect(ResearchChat.findOne).toHaveBeenCalledWith({ _id: 'chat-123', userId: 'user-123' });
    expect(response.options.status).toBe(404);
  });
});
