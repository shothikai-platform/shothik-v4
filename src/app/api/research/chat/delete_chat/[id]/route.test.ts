import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
import { NextResponse } from 'next/server';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';
import dbConnect from '@/lib/dbConnect';

// Mock dependencies
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

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => {
      const response = {
        ...data,
        ...options,
        json: async () => data,
        status: options?.status || 200,
      };
      return response;
    }),
  },
}));

describe('DELETE /api/research/chat/delete_chat/[id]', () => {
  const mockChatId = 'chat123';
  const mockUserId = 'user123';
  const mockParams = Promise.resolve({ id: mockChatId });
  const mockRequest = {} as Request;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await DELETE(mockRequest, { params: mockParams }) as any;

    expect(getAuthenticatedUser).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
    expect(ResearchChat.findOneAndDelete).not.toHaveBeenCalled();
  });

  it('should return 404 if chat is not found or does not belong to user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });
    (ResearchChat.findOneAndDelete as any).mockResolvedValue(null);

    const response = await DELETE(mockRequest, { params: mockParams }) as any;

    expect(dbConnect).toHaveBeenCalled();
    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
      _id: mockChatId,
      userId: mockUserId,
    });
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'Chat not found' });
  });

  it('should return 200 and success if chat is deleted', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ id: mockUserId });
    (ResearchChat.findOneAndDelete as any).mockResolvedValue({ _id: mockChatId, userId: mockUserId });

    const response = await DELETE(mockRequest, { params: mockParams }) as any;

    expect(ResearchChat.findOneAndDelete).toHaveBeenCalledWith({
      _id: mockChatId,
      userId: mockUserId,
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
  });
});
