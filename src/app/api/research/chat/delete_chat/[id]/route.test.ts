import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';
import ResearchChat from '@/models/ResearchChat';

// Mock the dependencies
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

vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn((data, options) => {
        return {
          ...data,
          status: options?.status || 200,
        };
      }),
    },
  };
});

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  const mockChatId = 'chat123';
  const mockUserId = 'user123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    // Mock unauthenticated user
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const request = new Request('http://localhost');
    const params = Promise.resolve({ id: mockChatId });

    const response = await DELETE(request, { params });

    expect(response).toEqual({
      error: 'Unauthorized',
      status: 401,
    });
    expect(ResearchChat.findOneAndDelete).not.toHaveBeenCalled();
  });

  it('should return 404 if chat is not found or user does not own it', async () => {
    // Mock authenticated user
    (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });

    // Mock chat not found (or not owned by user)
    (ResearchChat.findOneAndDelete as any).mockResolvedValue(null);

    const request = new Request('http://localhost');
    const params = Promise.resolve({ id: mockChatId });

    const response = await DELETE(request, { params });

    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
      _id: mockChatId,
      userId: mockUserId,
    });
    expect(response).toEqual({
      error: 'Chat not found',
      status: 404,
    });
  });

  it('should successfully delete a chat owned by the user', async () => {
    // Mock authenticated user
    (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });

    // Mock successful deletion
    (ResearchChat.findOneAndDelete as any).mockResolvedValue({ _id: mockChatId, userId: mockUserId });

    const request = new Request('http://localhost');
    const params = Promise.resolve({ id: mockChatId });

    const response = await DELETE(request, { params });

    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
      _id: mockChatId,
      userId: mockUserId,
    });
    expect(response).toEqual({
      success: true,
      status: 200,
    });
  });

  it('should return 500 on internal server error', async () => {
    // Mock authenticated user
    (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });

    // Mock database error
    (ResearchChat.findOneAndDelete as any).mockRejectedValue(new Error('DB Error'));

    const request = new Request('http://localhost');
    const params = Promise.resolve({ id: mockChatId });

    // suppress console.error for this test to avoid noisy output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await DELETE(request, { params });

    expect(response).toEqual({
      error: 'Failed',
      status: 500,
    });

    consoleSpy.mockRestore();
  });
});
