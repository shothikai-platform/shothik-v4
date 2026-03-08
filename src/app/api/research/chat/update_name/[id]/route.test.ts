import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
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
    findOneAndUpdate: vi.fn(),
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
      body: JSON.stringify({ name: 'New Title' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: '123' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 404 if chat is not found or user does not own it', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/update_name/123', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Title' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: '123' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Chat not found' });
    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: '123', userId: 'user1' },
      { title: 'New Title' },
      { new: true }
    );
  });

  it('should return success and chat data if updated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    const mockUpdatedChat = { _id: '123', title: 'New Title' };
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(mockUpdatedChat);

    const request = new Request('http://localhost/api/research/chat/update_name/123', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Title' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: '123' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockUpdatedChat);
    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: '123', userId: 'user1' },
      { title: 'New Title' },
      { new: true }
    );
  });
});
