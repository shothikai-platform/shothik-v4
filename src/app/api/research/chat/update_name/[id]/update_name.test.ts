import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
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
      findByIdAndUpdate: vi.fn(),
      findOneAndUpdate: vi.fn(),
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

describe('PUT /api/research/chat/update_name/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should deny access if user is not authenticated', async () => {
    (serverAuth.getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/update_name/123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
    });
    const params = Promise.resolve({ id: '123' });

    const response = await PUT(request, { params });

    expect(serverAuth.getAuthenticatedUser).toHaveBeenCalled();
    expect(response.init?.status).toBe(401);
  });

  it('should deny access if user does not own the chat', async () => {
    (serverAuth.getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/update_name/123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
    });
    const params = Promise.resolve({ id: '123' });

    const response = await PUT(request, { params });

    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: '123', userId: 'user1' },
        expect.any(Object),
        { new: true }
    );
    expect(response.init?.status).toBe(404);
  });

  it('should update chat name if user owns it', async () => {
    (serverAuth.getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    const updatedChat = { _id: '123', userId: 'user1', name: 'New Name' };
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(updatedChat);

    const request = new Request('http://localhost/api/research/chat/update_name/123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' })
    });
    const params = Promise.resolve({ id: '123' });

    const response = await PUT(request, { params });

    // Verify correct field usage ('name' instead of 'title')
    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: '123', userId: 'user1' },
        { name: 'New Name' },
        { new: true }
    );
    expect(response.body).toEqual(updatedChat);
  });
});
