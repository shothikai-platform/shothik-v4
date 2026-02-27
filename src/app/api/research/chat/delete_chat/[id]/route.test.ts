import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
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

vi.mock('next/server', () => {
    return {
        NextResponse: {
            json: (data: any, options: any) => ({ data, options, status: options?.status || 200 }),
        },
    };
});


describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  const mockChatId = 'chat-123';
  const mockUserId = 'user-456';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should FAIL when user is not authenticated', async () => {
    // Setup request
    const request = new Request(`http://localhost/api/research/chat/delete_chat/${mockChatId}`, {
      method: 'DELETE',
    });
    const params = Promise.resolve({ id: mockChatId });

    // Mock no user
    (getAuthenticatedUser as any).mockResolvedValue(null);

    // Execute
    const response: any = await DELETE(request, { params });

    // Verify secure behavior
    expect(response.status).toBe(401);
    expect(response.data).toEqual({ error: 'Unauthorized' });
    expect(ResearchChat.findOneAndDelete).not.toHaveBeenCalled();
  });

  it('should SUCCEED when user is authenticated and chat exists', async () => {
    // Setup request
    const request = new Request(`http://localhost/api/research/chat/delete_chat/${mockChatId}`, {
      method: 'DELETE',
    });
    const params = Promise.resolve({ id: mockChatId });

    // Mock authenticated user
    (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });

    // Mock successful deletion with scoped query
    (ResearchChat.findOneAndDelete as any).mockResolvedValue({ _id: mockChatId });

    // Execute
    const response: any = await DELETE(request, { params });

    // Verify
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ success: true });

    // Crucial: check it used findOneAndDelete with userId
    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith(expect.objectContaining({
        _id: mockChatId,
        userId: mockUserId
    }));
  });

   it('should FAIL when chat does not belong to user (IDOR prevention)', async () => {
    // Setup request
    const request = new Request(`http://localhost/api/research/chat/delete_chat/${mockChatId}`, {
      method: 'DELETE',
    });
    const params = Promise.resolve({ id: mockChatId });

    // Mock authenticated user
    (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });

    // Mock failure to find chat (scoped query returns null because userId doesn't match)
    (ResearchChat.findOneAndDelete as any).mockResolvedValue(null);

    // Execute
    const response: any = await DELETE(request, { params });

    // Verify
    expect(response.status).toBe(404); // Returns 404 which is secure (doesn't reveal existence)
    expect(response.data).toEqual({ error: 'Chat not found' });
  });
});
