import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ResearchChat from '@/models/ResearchChat';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/dbConnect', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/ResearchChat', () => ({
  default: {
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

describe('PUT /api/research/chat/update_name/[id]', () => {
  const mockUser = { _id: 'user123', name: 'Test User' };
  const mockChatId = 'chat123';
  const mockParams = Promise.resolve({ id: mockChatId });
  const mockBody = { name: 'New Chat Name' };
  let mockRequest: Request;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = {
      json: vi.fn().mockResolvedValue(mockBody),
    } as unknown as Request;
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await PUT(mockRequest, { params: mockParams });

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(ResearchChat.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('should update chat name if user is authorized and chat exists', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    const mockUpdatedChat = { _id: mockChatId, title: mockBody.name, userId: mockUser._id };
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(mockUpdatedChat);

    const response = await PUT(mockRequest, { params: mockParams });

    expect(dbConnect).toHaveBeenCalled();
    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockChatId, userId: mockUser._id },
      { title: mockBody.name },
      { new: true }
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockUpdatedChat);
  });

  it('should return 404 if chat is not found or does not belong to user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(null);

    const response = await PUT(mockRequest, { params: mockParams });

    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockChatId, userId: mockUser._id },
      { title: mockBody.name },
      { new: true }
    );
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: 'Chat not found' });
  });

  it('should handle fallback to user.id if user._id is missing', async () => {
    const userWithId = { id: 'user456', name: 'Another User' };
    (getAuthenticatedUser as any).mockResolvedValue(userWithId);
    const mockUpdatedChat = { _id: mockChatId, title: mockBody.name, userId: userWithId.id };
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(mockUpdatedChat);

    const response = await PUT(mockRequest, { params: mockParams });

    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockChatId, userId: userWithId.id },
      { title: mockBody.name },
      { new: true }
    );
    expect(response.status).toBe(200);
  });

  it('should return 500 if an error occurs', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (ResearchChat.findOneAndUpdate as any).mockRejectedValue(new Error('Database error'));

    // Silence console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await PUT(mockRequest, { params: mockParams });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Failed' });

    consoleSpy.mockRestore();
  });
});
