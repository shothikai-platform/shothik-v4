import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn().mockResolvedValue(true),
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

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/delete_chat/chat123', {
      method: 'DELETE',
    });
    const params = Promise.resolve({ id: 'chat123' });

    const response = await DELETE(request, { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 404 when chat is not found or does not belong to user (IDOR prevention)', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user123', email: 'test@example.com' });
    vi.mocked(ResearchChat.findOneAndDelete).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/delete_chat/chat123', {
      method: 'DELETE',
    });
    const params = Promise.resolve({ id: 'chat123' });

    const response = await DELETE(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Chat not found');
    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
      _id: 'chat123',
      userId: 'user123',
    });
  });

  it('should return success true when chat deletion succeeds', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user123', email: 'test@example.com' });
    vi.mocked(ResearchChat.findOneAndDelete).mockResolvedValue({ _id: 'chat123', userId: 'user123' });

    const request = new Request('http://localhost/api/research/chat/delete_chat/chat123', {
      method: 'DELETE',
    });
    const params = Promise.resolve({ id: 'chat123' });

    const response = await DELETE(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
      _id: 'chat123',
      userId: 'user123',
    });
  });
});
