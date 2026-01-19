import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import ResearchChat from '@/models/ResearchChat';
import { NextResponse } from 'next/server';
import * as serverAuth from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => {
  return {
    default: {
      findByIdAndDelete: vi.fn(),
      findOneAndDelete: vi.fn(),
    },
  };
});

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ body, init })),
  },
}));

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should deny access if user is not authenticated', async () => {
    (serverAuth.getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/delete_chat/123', { method: 'DELETE' });
    const params = Promise.resolve({ id: '123' });

    const response = await DELETE(request, { params });

    expect(serverAuth.getAuthenticatedUser).toHaveBeenCalled();
    expect(response.init?.status).toBe(401);
  });

  it('should deny access if user does not own the chat', async () => {
    (serverAuth.getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    (ResearchChat.findOneAndDelete as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/delete_chat/123', { method: 'DELETE' });
    const params = Promise.resolve({ id: '123' });

    const response = await DELETE(request, { params });

    // Expect findOneAndDelete to be called with userId check
    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({ _id: '123', userId: 'user1' });
    expect(response.init?.status).toBe(404);
  });

  it('should delete chat if user owns it', async () => {
    (serverAuth.getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    (ResearchChat.findOneAndDelete as any).mockResolvedValue({ _id: '123' });

    const request = new Request('http://localhost/api/research/chat/delete_chat/123', { method: 'DELETE' });
    const params = Promise.resolve({ id: '123' });

    const response = await DELETE(request, { params });

    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({ _id: '123', userId: 'user1' });
    expect(response.body).toEqual({ success: true });
  });
});
