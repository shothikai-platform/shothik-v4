import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';

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

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/delete_chat/123', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: '123' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 404 if chat is not found or user does not own it', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    (ResearchChat.findOneAndDelete as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/delete_chat/123', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: '123' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Chat not found' });
    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({ _id: '123', userId: 'user1' });
  });

  it('should return success if chat is deleted', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    (ResearchChat.findOneAndDelete as any).mockResolvedValue({ _id: '123' });

    const request = new Request('http://localhost/api/research/chat/delete_chat/123', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: '123' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({ _id: '123', userId: 'user1' });
  });
});
