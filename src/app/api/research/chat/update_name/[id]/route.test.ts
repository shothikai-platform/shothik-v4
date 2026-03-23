import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
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
    findOneAndUpdate: vi.fn(),
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

describe('PUT /api/research/chat/update_name/[id]', () => {
  const mockChatId = 'chat123';
  const mockUserId = 'user123';
  const mockParams = Promise.resolve({ id: mockChatId });
  const mockNewName = 'New Chat Name';
  const mockRequest = {
    json: vi.fn().mockResolvedValue({ name: mockNewName }),
  } as unknown as Request;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await PUT(mockRequest, { params: mockParams }) as any;

    expect(getAuthenticatedUser).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
    expect(ResearchChat.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('should return 404 if chat is not found or does not belong to user', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: mockUserId });
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(null);

    const response = await PUT(mockRequest, { params: mockParams }) as any;

    expect(dbConnect).toHaveBeenCalled();
    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockChatId, userId: mockUserId },
      { title: mockNewName },
      { new: true }
    );
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'Chat not found' });
  });

  it('should return 200 and updated chat if name is updated', async () => {
    const mockUpdatedChat = { _id: mockChatId, title: mockNewName, userId: mockUserId };
    (getAuthenticatedUser as any).mockResolvedValue({ id: mockUserId });
    (ResearchChat.findOneAndUpdate as any).mockResolvedValue(mockUpdatedChat);

    const response = await PUT(mockRequest, { params: mockParams }) as any;

    expect(ResearchChat.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockChatId, userId: mockUserId },
      { title: mockNewName },
      { new: true }
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(mockUpdatedChat);
  });
});
