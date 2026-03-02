import { NextResponse } from 'next/server';
import { DELETE } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findOneAndDelete: vi.fn(),
  },
}));

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);
    const request = new Request('http://localhost');
    const response = await DELETE(request, { params: Promise.resolve({ id: 'chat123' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should use findOneAndDelete with scoped userId and return 200 on success', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user123' });
    vi.mocked(ResearchChat.findOneAndDelete).mockResolvedValue({ _id: 'chat123' });

    const request = new Request('http://localhost');
    const response = await DELETE(request, { params: Promise.resolve({ id: 'chat123' }) });
    const data = await response.json();

    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
      _id: 'chat123',
      userId: 'user123'
    });
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should return 404 if chat is not found', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ _id: 'user123' });
    vi.mocked(ResearchChat.findOneAndDelete).mockResolvedValue(null);

    const request = new Request('http://localhost');
    const response = await DELETE(request, { params: Promise.resolve({ id: 'chat123' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Chat not found');
  });
});
