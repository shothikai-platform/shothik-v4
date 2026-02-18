import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { NextResponse } from 'next/server';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findByIdAndDelete: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/delete_chat/123', {
      method: 'DELETE',
    });
    const params = Promise.resolve({ id: '123' });

    const response = await DELETE(request, { params });

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json).toEqual({ error: 'Unauthorized' });
  });

  it('should return 404 if chat is not found or not owned by user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    (ResearchChat.findOneAndDelete as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/delete_chat/123', {
        method: 'DELETE',
    });
    const params = Promise.resolve({ id: '123' });

    const response = await DELETE(request, { params });

    expect(response.status).toBe(404);
    // Ensure we are calling the secure method
    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({ _id: '123', userId: 'user1' });
  });

  it('should return 200 if chat is deleted successfully', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    (ResearchChat.findOneAndDelete as any).mockResolvedValue({ _id: '123' });

    const request = new Request('http://localhost/api/research/chat/delete_chat/123', {
        method: 'DELETE',
    });
    const params = Promise.resolve({ id: '123' });

    const response = await DELETE(request, { params });

    expect(response.status).toBe(200);
    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({ _id: '123', userId: 'user1' });
  });
});
