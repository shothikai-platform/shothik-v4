import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findByIdAndDelete: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  const mockUser = { _id: 'user123', id: 'user123' };
  const mockChatId = 'chat123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);
    const request = new Request('http://localhost/api/research/chat/delete_chat/chat123');
    const params = Promise.resolve({ id: mockChatId });

    const response = await DELETE(request, { params });

    expect(response.status).toBe(401);
  });

  it('should return 404 if chat is not found or not owned by user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (ResearchChat.findOneAndDelete as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/research/chat/delete_chat/chat123');
    const params = Promise.resolve({ id: mockChatId });

    const response = await DELETE(request, { params });

    expect(response.status).toBe(404);
    // This confirms we are using the secure method
    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
      _id: mockChatId,
      userId: expect.anything() // matching userId check
    });
  });

  it('should delete chat if owned by user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (ResearchChat.findOneAndDelete as any).mockResolvedValue({ _id: mockChatId });

    const request = new Request('http://localhost/api/research/chat/delete_chat/chat123');
    const params = Promise.resolve({ id: mockChatId });

    const response = await DELETE(request, { params });

    expect(response.status).toBe(200);
    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
      _id: mockChatId,
      userId: mockUser._id
    });
  });
});
